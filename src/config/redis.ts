import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${
    process.env.REDIS_PORT || 6379
  }`,
});

redisClient.on("error", (err) => console.error("❌ Redis Client Hatası", err));
redisClient.on("connect", () => console.info("⚡ Redis bağlantısı aktif!"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis Bağlantı Başarısız:", err);
  }
})();

export default redisClient;
