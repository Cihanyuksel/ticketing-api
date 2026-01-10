import redisClient from "../../../config/redis";
import logger from "../../../utils/logger";

export class VenueCacheService {
  constructor(private redis: typeof redisClient = redisClient) {}

  private readonly CACHE_TTL = 3600;

  async set<T>(key: string, data: T): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(data), {
        EX: this.CACHE_TTL,
      });
      logger.debug(`✅ Cache set: ${key}`);
    } catch (error) {
      logger.error(`Cache set error [${key}]:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (data) return JSON.parse(data) as T;
      return null;
    } catch (error) {
      logger.error(`Cache get error [${key}]:`, error);
      return null;
    }
  }

  async clear(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.info(`🗑️ Cache cleared: ${key}`);
    } catch (error) {
      logger.error(`Cache clear error [${key}]:`, error);
    }
  }

  public getVenueKey(venueId: string): string {
    return `venue:${venueId}:details`;
  }

  async clearVenue(venueId: string) {
    return this.clear(this.getVenueKey(venueId));
  }
}
