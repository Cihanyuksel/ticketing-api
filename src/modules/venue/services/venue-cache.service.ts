import redisClient from "../../../config/redis";
import logger from "../../../utils/logger";

export class VenueCacheService {
  private readonly CACHE_TTL = 3600;

  async cacheVenueDetails(venueId: string, data: any): Promise<void> {
    try {
      const cacheKey = this.getVenueCacheKey(venueId);
      await redisClient.set(cacheKey, JSON.stringify(data), {
        EX: this.CACHE_TTL,
      });
      logger.info(`✅ Cache kaydedildi: ${cacheKey}`);
    } catch (error) {
      logger.error("Cache kaydetme hatası:", error);
    }
  }

  async getCachedVenueDetails(venueId: string): Promise<any | null> {
    try {
      const cacheKey = this.getVenueCacheKey(venueId);
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        logger.info(`⚡ Cache hit: ${cacheKey}`);
        return JSON.parse(cachedData);
      }

      logger.info(`❌ Cache miss: ${cacheKey}`);
      return null;
    } catch (error) {
      logger.error("Cache okuma hatası:", error);
      return null;
    }
  }

  async clearVenueCache(venueId: string): Promise<void> {
    try {
      const cacheKey = this.getVenueCacheKey(venueId);
      await redisClient.del(cacheKey);
      logger.info(`🗑️ Cache temizlendi: ${cacheKey}`);
    } catch (error) {
      logger.error("Cache temizleme hatası:", error);
    }
  }

  async clearMultipleVenueCaches(venueIds: string[]): Promise<void> {
    try {
      const cacheKeys = venueIds.map((id) => this.getVenueCacheKey(id));
      if (cacheKeys.length > 0) {
        await redisClient.del(cacheKeys);
        logger.info(`🗑️ ${cacheKeys.length} venue cache temizlendi`);
      }
    } catch (error) {
      logger.error("Toplu cache temizleme hatası:", error);
    }
  }

  private getVenueCacheKey(venueId: string): string {
    return `venue:${venueId}:details`;
  }

  async clearAllVenueCaches(): Promise<void> {
    try {
      const pattern = "venue:*:details";
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.warn(`🗑️ TÜM venue cache'leri temizlendi (${keys.length} adet)`);
      }
    } catch (error) {
      logger.error("Tüm cache temizleme hatası:", error);
    }
  }
}
