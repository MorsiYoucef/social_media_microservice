import rateLimit from 'express-rate-limit';


export const createBasicRateLimiter = ( maxRequests:number, time:number) =>{
    return rateLimit({
        windowMs: time, // 15 minutes
        max: maxRequests, // limit each IP to 100 requests per windowMs
        message: 'Too many requests, please try again later.',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
}