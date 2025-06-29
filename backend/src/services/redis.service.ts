import { createClient } from "redis";

export class RedisClient {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL! });
  }

  getClient() {
    return this.client;
  }
}
