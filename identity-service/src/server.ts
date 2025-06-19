import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./utils/logger";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import IdentityRoutes from "./routes/identity.route";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((e) => logger.error("MongoDB connection error:", e));

const redisClient = new Redis(process.env.REDIS_URL as string);

/**
 * !XSS is when an attacker injects malicious JavaScript into a website — and that script runs in other users' browsers.
 * !Clickjacking is when a malicious site loads your site inside a hidden iframe, tricking users into clicking buttons they don't see.
 * !MIME-sniffing is when a browser tries to guess the file type (MIME type) of a response — even if the server tells it otherwise.
 * !Injection is when untrusted data is sent to a command interpreter, like a database, in a way that changes its behavior.
 * !CORS (Cross-Origin Resource Sharing) is a security feature in browsers that restricts access between different origins (domains).
 * !🔐 Helmet sets secure headers to prevent or reduce these threats.
 */
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${req.body}`);
  next();
});

/**
 * !A brute force attack is when a hacker tries to guess a username + password or token by repeatedly trying thousands or millions of combinations.
 * !A DDoS attack floods your server with a massive amount of fake traffic, often from many computers at once (a botnet)
 */

// ?DDos protection
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, // 100 requests
  duration: 1, // per minute
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip as string)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).send("Too Many Requests");
    });
});

// ?IP based rate limiting for sensitive endpoints
const sensitiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per 15 minute
  standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too Many Requests");
  },
  store: new RedisStore({
    sendCommand: (...args: [string, ...string[]]): Promise<any> => {
      return redisClient.call(...args) as unknown as Promise<any>;
    },
  }),
});

app.use("/api/auth/register", sensitiveRateLimiter);

app.use("/api/auth", (req: Request, res:Response, next: NextFunction) =>{
  req.RedisClient = redisClient;
  next();
} ,IdentityRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service is running on port ${PORT}`);
});

// unhandeled promise rejection

process.on("unhandledRejection", (reason, promis) => {
  logger.error("Unhandled Rejection at:", reason);
  logger.error("Promise:", promis);
  process.exit(1);
});
