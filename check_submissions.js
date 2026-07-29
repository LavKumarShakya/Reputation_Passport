// Run with: node check_submissions.js
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // --- All submissions ---
    const submissions = await db.collection('usersubmissions').find({}).toArray();

    if (submissions.length === 0) {
        console.log('⚠️  No submissions found in database.');
        process.exit(0);
    }

    console.log(`Found ${submissions.length} submission(s):\n`);
    console.log('═'.repeat(70));

    for (const sub of submissions) {
        const statusEmoji = {
            pending:    '⏳',
            processing: '⚙️ ',
            verified:   '✅',
            rejected:   '❌',
            temp_failed:'🔄',
        }[sub.status] || '❓';

        console.log(`${statusEmoji} [${sub.status?.toUpperCase()}] ${sub.title}`);
        console.log(`   Type:     ${sub.type}`);
        console.log(`   Issuer:   ${sub.issuer}`);
        console.log(`   ID:       ${sub._id}`);
        if (sub.confidence !== undefined)
            console.log(`   Confidence:  ${sub.confidence}%`);
        if (sub.confidenceBreakdown && Object.keys(sub.confidenceBreakdown).length > 0) {
            console.log('   Breakdown:');
            for (const [key, val] of Object.entries(sub.confidenceBreakdown)) {
                console.log(`     · ${key.padEnd(30)} ${val}`);
            }
        }
        if (sub.verificationMessage)
            console.log(`   Reason:   ${sub.verificationMessage}`);
        if (sub.reputationPoints)
            console.log(`   Points:   +${sub.reputationPoints} reputation`);
        if (sub.ipfsHash)
            console.log(`   IPFS:     ${sub.ipfsHash}`);
        console.log(`   Attempts: ${sub.attempts ?? 0}`);
        console.log(`   Created:  ${new Date(sub.createdAt).toLocaleString()}`);
        console.log('─'.repeat(70));

        // --- Verification logs for this submission ---
        const logs = await db.collection('verificationlogs')
            .find({ submissionId: sub._id })
            .sort({ timestamp: 1 })
            .toArray();

        if (logs.length > 0) {
            console.log('   Verification Log:');
            for (const log of logs) {
                const r = { success: '✓', failure: '✗', skipped: '·', info: 'ℹ' }[log.result] || '?';
                console.log(`     [${r}] ${log.step.padEnd(35)} ${log.message}`);
            }
        } else {
            console.log('   No verification logs yet (still in queue or not started).');
        }

        console.log('═'.repeat(70) + '\n');
    }

    // --- BullMQ queue status via Redis ---
    try {
        const { Queue } = require('bullmq');
        const IORedis = require('ioredis');
        const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
        const queue = new Queue('verification', { connection: redis });

        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);

        console.log('📊 BullMQ Queue Status:');
        console.log(`   Waiting:   ${waiting}`);
        console.log(`   Active:    ${active}`);
        console.log(`   Completed: ${completed}`);
        console.log(`   Failed:    ${failed}`);
        console.log(`   Delayed:   ${delayed}`);

        await redis.quit();
    } catch (e) {
        console.log('⚠️  Could not read BullMQ queue (Redis may not be available)');
    }

    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
