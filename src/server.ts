import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.info("🔥 Veritabanı bağlantısı BAŞARILI! (Postgres)");

    app.listen(PORT, () => {
      console.info(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
      console.info(`👉 Sağlık kontrolü: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Kritik Başlangıç Hatası:", error);
    process.exit(1);
  }
};

startServer();
