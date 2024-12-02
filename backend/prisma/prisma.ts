import { PrismaClient as Prisma } from "@prisma/client";
import { logger } from "../src/config/winston";

class PrismaClient {
  private static instance: PrismaClient;
  private prisma: Prisma;
  private isConnected: boolean = false;
  private readonly maxRetries: number = 5;
  private readonly retryDelay: number = 5000;

  private constructor() {
    this.prisma = new Prisma({
      log: [
        { level: "warn", emit: "event" },
        { level: "info", emit: "event" },
        { level: "error", emit: "event" },
      ],
    });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.prisma.$on("error", (error) => {
      logger.error("Prisma error:", error);
      this.isConnected = false;
      this.attemptReconnect();
    });
  }

  private attemptReconnect(retry: number = 0): void {
    if (retry <= this.maxRetries) {
      setTimeout(() => {
        this.attemptReconnect(retry + 1);
      }, this.retryDelay);
    }
  }

  public static getInstance(): PrismaClient {
    if (!PrismaClient.instance) {
      PrismaClient.instance = new PrismaClient();
    }
    return PrismaClient.instance;
  }

  public async checkConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  public getPrismaClient(): Prisma {
    return this.prisma;
  }

  public get isDbConnected(): boolean {
    return this.isConnected;
  }
}
