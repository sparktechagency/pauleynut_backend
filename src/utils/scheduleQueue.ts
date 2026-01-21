import { Queue } from 'bullmq';
import redisConnection from '../config/redis';


export const scheduleQueue = new Queue('scheduleQueue', {
    connection: redisConnection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
});

console.log('📦 Schedule Queue initialized');