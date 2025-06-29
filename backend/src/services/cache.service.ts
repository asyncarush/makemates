// services/cache.service.ts
import { redisClient } from "../index";

export class CacheService {
  static async get(key: string) {
    return await redisClient.get(key);
  }

  static async set(key: string, value: any, expirationSeconds: number = 1800) {
    return await redisClient.setEx(
      key,
      expirationSeconds,
      JSON.stringify(value)
    );
  }

  static async delete(key: string) {
    return await redisClient.del(key);
  }

  static async invalidatePattern(pattern: string) {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      return await redisClient.del(keys);
    }
  }
}
