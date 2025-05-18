
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

const prisma = new PrismaClient();

interface NotificationData {
  message: string;
  type: string;
  resource_id: number;
  user_sender_id: number;
  isRead: boolean;
}

export class NotificationManger {
  private connection: IORedis;
  private queue: Queue;
  private worker: Worker;
  private io: Server;

  constructor(io: Server) {
    this.connection = new IORedis(
      process.env.REDIS_URL! || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
      }
    );
    this.queue = new Queue("notification", { connection: this.connection });
    this.io = io;

    // Create the worker once during initialization
    this.worker = new Worker(
      "notification",
      async (job) => {
        const { batch_recipients, ...notificationData } = job.data;

        try {
          // Create notifications for all recipients in batch
          const allCalls = batch_recipients.map((followID: number) =>
            prisma.notifications.create({
              data: {
                user_reciever_id: followID,
                user_sender_id: notificationData.user_sender_id,
                type: notificationData.type,
                resource_id: notificationData.resource_id,
                message: notificationData.message,
                isRead: false,
              },
            })
          );

          await Promise.all(allCalls);

          return { success: true };
        } catch (error) {
          console.error("Error creating notifications:", error);
          throw error;
        }
      },
      { connection: this.connection }
    );

    // Set up event handlers for the worker
    this.worker.on("completed", (job) => {
      // console.log(`Notification batch job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`Notification batch job ${job?.id} failed:`, err);
    });
  }

  async addNotification(jobName: string, data: NotificationData) {
    // fetch followers id, just want to retrieve id like [1,2,4,8]
    const followers = await prisma.relationships.findMany({
      where: { follower_id: data.user_sender_id },
      select: {
        follow_id: true,
      },
    });

    if (followers.length === 0) return;

    // group the follower into batches of 50
    const batches = [];
    const batchSize = 50;
    for (let i = 0; i < followers.length; i += batchSize) {
      batches.push(followers.slice(i, i + batchSize));
    }

    // console.log("================================================");
    // console.log("followers", followers);
    // console.log("followers Batches", batches);
    // console.log("================================================");

    // send notification to followers
    for (const batch of batches) {
      await this.queue.add(jobName, {
        ...data,
        batch_recipients: batch.map((f) => f.follow_id),
      });
    }
  }

  // Add a cleanup method to close connections when shutting down
  async close() {
    await this.worker.close();
    await this.queue.close();
    await this.connection.quit();
  }
}
