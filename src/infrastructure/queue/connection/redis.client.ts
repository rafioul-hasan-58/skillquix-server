import IORedis from "ioredis";
import config from "../../../config";

export const redisConnection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, // required by BullMQ
});

redisConnection.on("connect", () => console.log("✅ Redis connected!"));
redisConnection.on("error", (err) => console.error("❌ Redis error:", err));