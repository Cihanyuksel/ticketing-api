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
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
  } catch (err) {
    console.error("❌ Redis Bağlantı Başarısız:", err);
  }
})();

// 🔥 KRİTİK EKLEME: 
// Oluşturduğumuz client'ın tipini (RESP3 dahil) tam olarak dışarı aktarıyoruz.
export type AppRedisClient = typeof redisClient;

export default redisClient;