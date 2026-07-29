import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Server as SocketServer } from 'socket.io';
import UserSubmission from '../models/UserSubmission';
import VerificationLog from '../models/VerificationLog';
import User from '../models/User';
import { VerificationService } from '../services/verification/VerificationService';
import { uploadToIPFS, cleanupTempFile } from '../services/ipfs';
import { applyReputation, calculateReputationPoints } from '../services/reputationEngine';
import { addCredentialOnChain } from '../services/blockchain';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Create and start the BullMQ verification worker.
 * @param io  Socket.io server instance for real-time push notifications
 */
export function startVerificationWorker(io: SocketServer): Worker {
    const redisConfig: any = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        keepAlive: 10000,
        ...(REDIS_URL.startsWith('rediss://') && {
            tls: { rejectUnauthorized: false },
            family: 0,
        }),
    };
    const connection = new IORedis(REDIS_URL, redisConfig);

    const worker = new Worker(
        'verification',
        async (job: Job) => {
            const { submissionId } = job.data;
            console.log(`[Worker] Processing job ${job.id} → submission: ${submissionId}`);

            // ── 1. Load submission ─────────────────────────────────────────
            const submission = await UserSubmission.findById(submissionId);
            if (!submission) {
                throw new Error(`Submission ${submissionId} not found — possibly deleted`);
            }

            const sid = submission._id.toString();
            const userId = submission.userId.toString();

            // ── 2. Mark as processing ──────────────────────────────────────
            await UserSubmission.findByIdAndUpdate(sid, {
                status: 'processing',
                $inc: { attempts: 1 },
            });

            await VerificationLog.create({
                submissionId: sid,
                step: 'worker_started',
                result: 'info',
                message: `Worker picked up job. Attempt ${job.attemptsMade + 1} of ${job.opts.attempts ?? 5}`,
            });

            // Emit real-time update: processing started
            io.to(userId).emit('submission:update', {
                submissionId: sid,
                status: 'processing',
                message: 'Verification started',
            });

            // ── 3. Load the user (needed for GitHub token, display name) ───
            const user = await User.findById(userId);
            if (!user) throw new Error(`User ${userId} not found`);

            // ── 4. Select verifier via Strategy Pattern ────────────────────
            const verifier = VerificationService.getVerifier(submission.type);

            // ── 5. Run verification ────────────────────────────────────────
            let result;
            try {
                result = await verifier.verify(submission, user);
            } catch (verifyErr: any) {
                // If verifier throws a network error, let BullMQ retry (exponential backoff)
                await UserSubmission.findByIdAndUpdate(sid, { status: 'temp_failed' });
                await VerificationLog.create({
                    submissionId: sid,
                    step: 'verification_error',
                    result: 'failure',
                    message: `Temporary failure (attempt ${job.attemptsMade + 1}): ${verifyErr.message}`,
                });
                io.to(userId).emit('submission:update', {
                    submissionId: sid,
                    status: 'temp_failed',
                    message: `Retrying... (${verifyErr.message})`,
                });
                throw verifyErr; // BullMQ will retry
            }

            // ── 6. Handle VERIFIED path ────────────────────────────────────
            if (result.verified) {
                // 6a. Upload file to IPFS (only on success)
                let ipfsHash: string | undefined;
                if (submission.tempFilePath) {
                    try {
                        ipfsHash = await uploadToIPFS(
                            submission.tempFilePath,
                            submission.originalFileName || 'certificate'
                        );
                        await VerificationLog.create({
                            submissionId: sid,
                            step: 'ipfs_upload',
                            result: 'success',
                            message: `File uploaded to IPFS: ${ipfsHash}`,
                        });
                    } catch (ipfsErr: any) {
                        await VerificationLog.create({
                            submissionId: sid,
                            step: 'ipfs_upload',
                            result: 'failure',
                            message: `IPFS upload failed: ${ipfsErr.message}`,
                        });
                    } finally {
                        cleanupTempFile(submission.tempFilePath);
                    }
                }

                // 6b. Calculate reputation points
                submission.confidence = result.confidence;
                const reputationPoints = calculateReputationPoints(submission);

                // 6c. Update submission to VERIFIED
                await UserSubmission.findByIdAndUpdate(sid, {
                    status: 'verified',
                    confidence: result.confidence,
                    confidenceBreakdown: result.breakdown,
                    verificationMessage: result.reason,
                    reputationPoints,
                    ipfsHash,
                    tempFilePath: undefined, // clear temp path
                });

                // 6d. Apply reputation (dedicated service)
                const updatedSubmission = await UserSubmission.findById(sid);
                let newScore = 0;
                let newTier = 'bronze';
                if (updatedSubmission) {
                    const reputationResult = await applyReputation(userId, updatedSubmission);
                    newScore = reputationResult.newScore;
                    newTier = reputationResult.newTier;

                    await VerificationLog.create({
                        submissionId: sid,
                        step: 'reputation_updated',
                        result: 'success',
                        message: `+${reputationPoints} pts → total: ${newScore} (${newTier})`,
                    });
                }

                // 6e. Record on blockchain (separate concern, non-blocking)
                if (ipfsHash) {
                    (async () => {
                        try {
                            if (user.walletAddress) {
                                const txHash = await addCredentialOnChain(
                                    user.walletAddress,
                                    ipfsHash!,
                                    submission.type
                                );
                                if (txHash) {
                                    await VerificationLog.create({
                                        submissionId: sid,
                                        step: 'blockchain_updated',
                                        result: 'success',
                                        message: `On-chain tx: ${txHash}`,
                                    });
                                    await UserSubmission.findByIdAndUpdate(sid, { 'metadata.txHash': txHash });
                                }
                            }
                        } catch (chainErr: any) {
                            await VerificationLog.create({
                                submissionId: sid,
                                step: 'blockchain_updated',
                                result: 'failure',
                                message: `Blockchain record failed: ${chainErr.message}`,
                            });
                        }
                    })();
                }

                // 6f. Push real-time notification to user
                io.to(userId).emit('submission:update', {
                    submissionId: sid,
                    status: 'verified',
                    confidence: result.confidence,
                    breakdown: result.breakdown,
                    reputationPoints,
                    newScore,
                    newTier,
                    message: result.reason,
                });

                console.log(`[Worker] ✅ Verified: ${sid} (confidence: ${result.confidence}%)`);

            // ── 7. Handle REJECTED path ────────────────────────────────────
            } else {
                // Clean up temp file even on rejection
                if (submission.tempFilePath) {
                    cleanupTempFile(submission.tempFilePath);
                }

                await UserSubmission.findByIdAndUpdate(sid, {
                    status: 'rejected',
                    confidence: result.confidence,
                    confidenceBreakdown: result.breakdown,
                    verificationMessage: result.reason,
                    tempFilePath: undefined,
                });

                await VerificationLog.create({
                    submissionId: sid,
                    step: 'verification_complete',
                    result: 'failure',
                    message: `Rejected: ${result.reason}`,
                });

                // Push real-time notification
                io.to(userId).emit('submission:update', {
                    submissionId: sid,
                    status: 'rejected',
                    confidence: result.confidence,
                    breakdown: result.breakdown,
                    message: result.reason,
                });

                console.log(`[Worker] ❌ Rejected: ${sid} — ${result.reason}`);
            }
        },
        {
            connection,
            concurrency: 3, // process up to 3 submissions simultaneously
        }
    );

    worker.on('failed', async (job, err) => {
        if (!job) return;
        const { submissionId } = job.data;
        const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 5) - 1;

        console.error(`[Worker] Job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);

        if (isLastAttempt) {
            // All retries exhausted — mark as permanently rejected
            await UserSubmission.findByIdAndUpdate(submissionId, {
                status: 'rejected',
                verificationMessage: `Verification failed after ${job.attemptsMade} attempts: ${err.message}`,
                tempFilePath: undefined,
            });

            const submission = await UserSubmission.findById(submissionId);
            if (submission) {
                const userId = submission.userId.toString();
                io.to(userId).emit('submission:update', {
                    submissionId,
                    status: 'rejected',
                    message: `Verification failed after maximum retries. Please check your details and resubmit.`,
                });
            }
        }
    });

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed successfully`);
    });

    console.log('🔄 Verification worker started (concurrency: 3)');
    return worker;
}
