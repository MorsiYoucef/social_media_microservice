import Redis from "ioredis";

const redis = new Redis({
  host:"localhost",
  port: parseInt("6379", 10),
  password: undefined,
  db: parseInt("0", 10),
});

export async function ioRedisDemo() {
    try {
        await redis.set("key", "value");
        const value = await redis.get("key");

        console.log("Value from Redis:", value);
    } catch (error) {
        console.log("Error:", error);
    }
}
