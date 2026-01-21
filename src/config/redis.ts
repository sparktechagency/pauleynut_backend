import Redis from 'ioredis';

// Redis connection options
import IORedis from 'ioredis';

export const redisConnection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});

// Optional: Handle connection events
redisConnection.on('connect', () => {
    console.log('✅ Redis connected');
});

redisConnection.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

export default redisConnection;