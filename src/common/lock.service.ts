import redisClient from "../config/redis";

export class LockService {
  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await redisClient.set(key, "LOCKED", {
      EX: ttlSeconds,
      NX: true,
    });
    return result === "OK";
  }

  async releaseLock(key: string): Promise<void> {
    await redisClient.del(key);
  }
}
