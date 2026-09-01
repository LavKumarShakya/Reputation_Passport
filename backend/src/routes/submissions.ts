import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { authenticate, AuthRequest } from '../middleware/auth';
import UserSubmission, { SubmissionType } from '../models/UserSubmission';
import VerificationLog from '../models/VerificationLog';
import { enqueueVerification } from '../queues/verificationQueue';
import { revokeReputation } from '../services/reputationEngine';

const router = Router();

// ── Multer config — store files in OS temp dir ──────────────────────────────
const UPLOAD_DIR = path.join(os.tmpdir(), 'aura-submissions');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, PNG, or WebP files are allowed'));
        }
    },
});

// Required fields per submission type
const REQUIRED_FIELDS: Record<SubmissionType, string[]> = {
    certificate:  ['title', 'issuer'],
    hackathon:    ['title', 'issuer'],
    research:     ['title', 'issuer'],
    opensource:   ['title', 'issuer'],
    workshop:     ['title', 'issuer'],
    competition:  ['title', 'issuer'],
};

// ── POST /api/submissions — Submit a new achievement ─────────────────────────
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { type, title, issuer, verificationUrl, metadata } = req.body;

        // 1. Validate type
        const validTypes: SubmissionType[] = ['certificate', 'hackathon', 'research', 'opensource', 'workshop', 'competition'];
        if (!validTypes.includes(type)) {
            res.status(400).json({ error: `Invalid submission type. Must be one of: ${validTypes.join(', ')}` });
            return;
        }

        // 2. Validate required fields
        const required = REQUIRED_FIELDS[type as SubmissionType];
        for (const field of required) {
            if (!req.body[field]) {
                res.status(400).json({ error: `Missing required field: ${field}` });
                return;
            }
        }

        // 3. Validate URL format if provided
        if (verificationUrl) {
            try { new URL(verificationUrl); } catch {
                res.status(400).json({ error: 'Invalid verification URL format' });
                return;
            }
        }

        // 4. Parse metadata
        let parsedMetadata: Record<string, any> = {};
        if (metadata) {
            try {
                parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
            } catch {
                res.status(400).json({ error: 'Invalid metadata JSON' });
                return;
            }
        }

        // 5. Check for duplicate (same user + type + title + issuer)
        const existing = await UserSubmission.findOne({ userId, type, title, issuer });
        if (existing) {
            res.status(409).json({
                error: 'You have already submitted this achievement',
                existingId: existing._id,
                existingStatus: existing.status,
            });
            return;
        }

        // 6. Create submission in DB (file NOT yet on IPFS — stored locally)
        const submission = await UserSubmission.create({
            userId,
            type,
            title,
            issuer,
            verificationUrl: verificationUrl || undefined,
            tempFilePath: req.file?.path,
            originalFileName: req.file?.originalname,
            originalFileMime: req.file?.mimetype,
            status: 'pending',
            metadata: parsedMetadata,
            attempts: 0,
        });

        // 7. Add to BullMQ queue (Redis handles the rest)
        await enqueueVerification(submission._id.toString());

        // 8. Write initial log entry
        await VerificationLog.create({
            submissionId: submission._id,
            step: 'submission_received',
            result: 'info',
            message: `Submission "${title}" queued for ${type} verification`,
        });

        // 9. Return immediately (202 Accepted)
        res.status(202).json({
            message: 'Achievement submitted. Verification is in progress.',
            submission: {
                id: submission._id,
                type: submission.type,
                title: submission.title,
                issuer: submission.issuer,
                status: submission.status,
                createdAt: submission.createdAt,
            },
        });
    } catch (error: any) {
        console.error('[Submissions] POST error:', error);
        // Multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
            return;
        }
        res.status(500).json({ error: 'Failed to submit achievement' });
    }
});

// ── GET /api/submissions — Get current user's submissions ────────────────────
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const submissions = await UserSubmission.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('-tempFilePath'); // Don't expose internal file paths

        res.json({ submissions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// ── GET /api/submissions/:id — Get single submission ─────────────────────────
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const submission = await UserSubmission.findOne({
            _id: req.params.id,
            userId: req.userId,
        }).select('-tempFilePath');

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        res.json({ submission });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// ── GET /api/submissions/:id/logs — Get verification audit trail ──────────────
router.get('/:id/logs', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        // Verify submission belongs to user
        const submission = await UserSubmission.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        const logs = await VerificationLog.find({ submissionId: req.params.id })
            .sort({ timestamp: 1 });

        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification logs' });
    }
});

// ── PATCH /api/submissions/:id/resubmit — Re-queue a rejected submission ──────
router.patch('/:id/resubmit', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const submission = await UserSubmission.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        if (!['rejected', 'temp_failed'].includes(submission.status)) {
            res.status(400).json({ error: 'Only rejected or failed submissions can be resubmitted' });
            return;
        }

        // Update fields if provided
        const updates: Partial<typeof submission> = {
            status: 'pending' as any,
            confidence: undefined,
            confidenceBreakdown: undefined,
            verificationMessage: undefined,
            reputationPoints: undefined,
        } as any;

        if (req.body.verificationUrl) (updates as any).verificationUrl = req.body.verificationUrl;
        if (req.body.metadata) {
            try {
                (updates as any).metadata = typeof req.body.metadata === 'string'
                    ? JSON.parse(req.body.metadata)
                    : req.body.metadata;
            } catch {}
        }
        if (req.file) {
            // Clean up old temp file
            if (submission.tempFilePath) {
                try { fs.unlinkSync(submission.tempFilePath); } catch {}
            }
            (updates as any).tempFilePath = req.file.path;
            (updates as any).originalFileName = req.file.originalname;
            (updates as any).originalFileMime = req.file.mimetype;
        }

        await UserSubmission.findByIdAndUpdate(req.params.id, updates);

        // Re-enqueue
        await enqueueVerification(submission._id.toString());

        await VerificationLog.create({
            submissionId: submission._id,
            step: 'resubmitted',
            result: 'info',
            message: 'Submission resubmitted by user for re-verification',
        });

        res.json({ message: 'Submission re-queued for verification', status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resubmit achievement' });
    }
});

// ── DELETE /api/submissions/:id — Delete pending/rejected submission ──────────
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const submission = await UserSubmission.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        if (submission.status === 'verified') {
            await revokeReputation(req.userId as string, submission);
        }

        // Clean up temp file
        if (submission.tempFilePath) {
            try { fs.unlinkSync(submission.tempFilePath); } catch {}
        }

        await UserSubmission.findByIdAndDelete(req.params.id);
        await VerificationLog.deleteMany({ submissionId: req.params.id });

        res.json({ message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

export default router;
