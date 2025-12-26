import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db";
import logger from "./utils/logger";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("🔥 Veritabanı bağlantısı BAŞARILI! (Postgres)");

    app.listen(PORT, () => {
      logger.info(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
      logger.info(`👉 Sağlık kontrolü: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("❌ Kritik Başlangıç Hatası:", error);
    process.exit(1);
  }
};

startServer();
