import { RateLimiterRedis } from "rate-limiter-flexible";
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import Redis from "ioredis";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import messageRoutes from "./routes/message.route";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { connectToRabbitMQ } from "./utils/rabbitMQ";
import { app, server } from "./utils/socket";
import path from "path";

dotenv.config();

//Initialize Express
const PORT = process.env.PORT || 3005
const __dirname = path.resolve();


mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((e) => logger.error("MongoDB connection error:", e));

const redisClient = new Redis(process.env.REDIS_URL as string);


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 100, // 10 requests per minute
  duration: 60, // per minute
});


app.use(
  "/api/messages",
  (req: Request, res: Response, next: NextFunction) => {
    req.RedisClient = redisClient;
    next();
  },
  messageRoutes
);


async function startServer() {
  try {
    await connectToRabbitMQ();
    server.listen(PORT, () => {
      logger.info(` Chat service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Server start error:", error);
    process.exit(1);
  }
}


startServer();

