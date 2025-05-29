// redisClient.ts
import { createClient } from 'redis';

const redisClient = createClient({
    socket: {
        host: 'localhost',
        port: 6380,
    },
    database: 0, // Optional: use a specific Redis DB index
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

export async function connectRedis() {
    try {
        await redisClient.connect();
        console.log('✅ Connected to Redis');
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
    }
}

export default redisClient;
