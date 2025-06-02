import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis'
import logger from './utils/logger';
import proxy from 'express-http-proxy';
import { errorHandler } from './middlewares/errorHandler';
import { validateToken } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL as string);

app.use(helmet());
app.use(cors());
app.use(express.json());



// rate limiting
// ?IP based rate limiting for sensitive endpoints
const rateLimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000, // 1 minute
    max: 50, // limit each IP to 50 requests per 15 minute
    standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: 'Too Many Requests' });
    },
    store: new RedisStore({
        sendCommand: (...args: [string, ...string[]]): Promise<any> => {
            return redisClient.call(...args) as unknown as Promise<any>;
        },
    }),
});

app.use(rateLimitOptions)

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
})


const proxyOptions = {
    proxyReqPathResolver: (req: Request) => {
        return req.originalUrl.replace(/^\/v1/, '/api');
    },
    proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).send('Internal Server Error');
    }
}

// setting up proxy for out identity service
app.use("/v1/auth", proxy(process.env.IDENTITY_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq) => { // Function to customize HTTP options for proxied requests
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        // you can change the method;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => { // Modifies response from downstream service before sending it to client
        logger.info(`Response Received from Identity Service: ${proxyRes.statusCode}`);
        return proxyResData
    }
}));


// setting up proxy for out post service
app.use('/v1/contents', validateToken, proxy(process.env.POST_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: any) => { // Function to customize HTTP options for proxied requests
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => { // Modifies response from downstream service before sending it to client
        logger.info(`Response Received from Post Service: ${proxyRes.statusCode}`);
        return proxyResData
    }
}
));


app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`Identity Service is runnig on port ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service is running on port ${process.env.POST_SERVICE_URL}`);
    logger.info(`Redis is connected at ${process.env.REDIS_URL}`);
});