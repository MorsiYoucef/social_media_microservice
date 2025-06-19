import Redis from "ioredis";

export {};

declare global {
  namespace Express {
    export interface IUser {
      userId: string;
    }
    export interface Request {
      user?: IUser;
      RedisClient: Redis;
    }
  }
}
