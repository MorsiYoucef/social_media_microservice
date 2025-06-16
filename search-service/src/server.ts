import { RateLimiterRedis } from "rate-limiter-flexible";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import Redis from "ioredis";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitMQ";
import searchRoute from './routes/search.route'
import { handlePostCreated, handlePostDeleted } from "./events-handlers/event.handler";

dotenv.config();

const app = express();
const PORT : string = process.env.PORT || "3004";

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((e) => logger.error("MongoDB connection error:", e));

const redisClient = new Redis(process.env.REDIS_URL as string);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${req.body}`);
  next();
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 100, // 100 requests per minute
  duration: 60, // per minute
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

app.use("/api/search", searchRoute);


app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (reason, promis) => {
  logger.error("Unhandled Rejection at:", reason);
  logger.error("Promise:", promis);
  process.exit(1);
});
