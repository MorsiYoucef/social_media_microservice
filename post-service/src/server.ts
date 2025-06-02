import { RateLimiterRedis } from 'rate-limiter-flexible';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import helmet from'helmet'
import postRoutes from './routes/post.route'
import {errorHandler} from './middlewares/errorHandler';
import logger from './utils/logger';
import {rateLimit} from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => logger.info("Connected to MongoDB"))
    .catch(e => logger.error("MongoDB connection error:", e));

const redisClient = new Redis(process.env.REDIS_URL as string);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${(req.body)}`);
    next();
})

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 100, // 10 requests per minute
    duration: 60, // per minute
})

app.use((req, res, next) => {
    rateLimiter.consume(req.ip as string)
        .then(() => {
            next();
        })
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).send('Too Many Requests');
        });
});

// ?IP based rate limiting for sensitive endpoints
const sensitiveRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 50 requests per 15 minute
    standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).send('Too Many Requests');
    },
    store: new RedisStore({
        sendCommand: (...args: [string, ...string[]]): Promise<any> => {
            return redisClient.call(...args) as unknown as Promise<any>;
        },
    }),
});

app.use('/api/contents/creaet-posts', sensitiveRateLimiter);

app.use('/api/contents', ( req:any, res, next) => {
    req.RedisClient = redisClient;
    next();
}, postRoutes);


app.use(errorHandler);

app.listen( PORT, () => {
    logger.info(`Identity service is running on port ${PORT}`);
});

// unhandeled promise rejection

process.on('unhandledRejection', (reason, promis) => {
    logger.error('Unhandled Rejection at:', reason);
    logger.error('Promise:', promis);
    process.exit(1);
})