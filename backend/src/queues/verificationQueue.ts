import { Queue, QueueEvents } from 'bullmq';
import { createRedisClient } from '../config/redis';

// Shared Redis connection for BullMQ
export const redisConnection = createRedisClient('QueueProducer');

// The verification queue
export const verificationQueue = new Queue('verification', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 30_000, // 30s → 60s → 120s → 240s → 480s
        },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 200 },
    },
});

// Queue event listener for logging
export const verificationQueueEvents = new QueueEvents('verification', {
    connection: createRedisClient('QueueEvents'),
});

/**
 * Add a new verification job to the BullMQ queue.
 * @param submissionId  MongoDB ObjectId of the UserSubmission
 * @param priority      Lower number = higher priority (default 10)
 */
export async function enqueueVerification(
    submissionId: string,
    priority: number = 10
): Promise<void> {
    await verificationQueue.add(
        'verify',
        { submissionId },
        { priority }
    );
    console.log(`[Queue] Enqueued verification job for submission: ${submissionId}`);
}
