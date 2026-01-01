import { createClient } from "redis";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${
    process.env.REDIS_PORT || 6379
  }`,
});

redisClient.on("error", (err) => logger.error("❌ Redis Client Hatası", err));
redisClient.on("connect", () => logger.info("⚡ Redis bağlantısı aktif!"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error("❌ Redis Bağlantı Başarısız:", err);
  }
})();

export default redisClient;
