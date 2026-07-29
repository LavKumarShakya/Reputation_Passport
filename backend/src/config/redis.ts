import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const isTLSRedis = REDIS_URL.startsWith('rediss://');

export const redisConfig: any = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 10000,
    ...(isTLSRedis && {
        tls: { rejectUnauthorized: false },
        family: 0,
    }),
};

/**
 * Creates a new Redis client instance with standardized options and event handlers.
 * Crucial for preventing "Unhandled error event" crashes on ECONNRESET.
 */
export function createRedisClient(purpose: string): IORedis {
    const client = new IORedis(REDIS_URL, redisConfig);

    client.on('connect', () => {
        console.log(`✅ Redis connected (${purpose})`);
    });

    client.on('ready', () => {
        console.log(`⚡ Redis ready (${purpose})`);
    });

    client.on('error', (err: any) => {
        // Log cleanly to prevent Node process from crashing due to unhandled error event
        console.error(`❌ Redis error (${purpose}):`, err.message || err);
    });

    client.on('close', () => {
        console.log(`🔌 Redis connection closed (${purpose})`);
    });

    client.on('end', () => {
        console.log(`🛑 Redis connection ended (${purpose})`);
    });

    client.on('reconnecting', (delay: number) => {
        console.log(`🔄 Redis reconnecting in ${delay}ms (${purpose})`);
    });

    return client;
}
