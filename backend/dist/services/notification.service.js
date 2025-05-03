"use strict";
// import { Socket } from "socket.io";
// import { Queue, Worker } from "bullmq";
// import IORedis from "ioredis";
// import { PrismaClient } from "@prisma/client";
// import { Server } from "socket.io";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManger = void 0;
// const prisma = new PrismaClient();
// interface NotificationData {
//   message: string;
//   type: string;
//   resource_id: number;
//   user_sender_id: number;
//   isRead: boolean;
// }
// export class NotificationManger {
//   private connection: IORedis;
//   private queue: Queue;
//   private io: Server;
//   constructor(io: Server) {
//     this.connection = new IORedis(
//       process.env.REDIS_URL! || "redis://localhost:6379",
//       {
//         maxRetriesPerRequest: null,
//       }
//     );
//     this.queue = new Queue("notification", { connection: this.connection });
//     this.io = io;
//   }
//   async addNotification(jobName: string, data: NotificationData) {
//     // fetch followers id, I jut want to retrieve id like [1,2,4,8]
//     const followers = await prisma.relationships.findMany({
//       where: { follower_id: data.user_sender_id },
//       select: {
//         follow_id: true,
//       },
//     });
//     if (followers.length === 0) return;
//     // group the follower into batches of 50
//     const batches = [];
//     const batchSize = 50;
//     for (let i = 0; i < followers.length; i += batchSize) {
//       batches.push(followers.slice(i, i + batchSize));
//     }
//     console.log("================================================");
//     console.log("followers", followers);
//     console.log("followers Bactches", batches);
//     console.log("================================================");
//     // send notification to followers
//     batches.forEach((batch) => {
//       this.queue.add(jobName, {
//         ...data,
//         batch_recipients: batch.map((f) => f.follow_id),
//       });
//     });
//     const worker = new Worker(
//       "notification",
//       async (job) => {
//         const { batch_recipients, ...notificationData } = job.data;
//         try {
//           // Create notifications for all recipients in batch
//           // const notification = await prisma.notifications.createMany({
//           //   data: batch_recipients.map((receiverId: number) => ({
//           //     user_reciever_id: receiverId,
//           //     user_sender_id: notificationData.user_sender_id,
//           //     type: notificationData.type,
//           //     resource_id: notificationData.resource_id,
//           //     message: notificationData.message,
//           //     isRead: false,
//           //   })),
//           // });
//           const allCalls = batch_recipients.map((followID: any) =>
//             prisma.notifications.create({
//               data: {
//                 user_reciever_id: followID,
//                 user_sender_id: notificationData.user_sender_id,
//                 type: notificationData.type,
//                 resource_id: notificationData.resource_id,
//                 message: notificationData.message,
//                 isRead: false,
//               },
//             })
//           );
//           const response = await Promise.all(allCalls);
//           console.log("Notification creation responses:", response);
//           console.log("Reaching here, and saved to database.");
//           console.log("Notificaton created for : ", notificationData);
//           // Send socket notification to online users
//           for (const receiverId of batch_recipients) {
//             // Emit to specific user if they're online
//             this.io.to(`user:${receiverId}`).emit("new_notification");
//           }
//           console.log("Notification are sent over socket");
//           return { success: true };
//         } catch (error) {
//           console.error("Error creating notifications:", error);
//           throw error;
//         }
//       },
//       { connection: this.connection }
//     );
//     worker.on("completed", (job) => {
//       console.log(`Notification batch job ${job.id} completed`);
//     });
//     worker.on("failed", (job, err) => {
//       console.error(`Notification batch job ${job?.id} failed:`, err);
//     });
//   }
// }
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationManger {
    constructor(io) {
        this.connection = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379", {
            maxRetriesPerRequest: null,
        });
        this.queue = new bullmq_1.Queue("notification", { connection: this.connection });
        this.io = io;
        // Create the worker once during initialization
        this.worker = new bullmq_1.Worker("notification", (job) => __awaiter(this, void 0, void 0, function* () {
            const _a = job.data, { batch_recipients } = _a, notificationData = __rest(_a, ["batch_recipients"]);
            try {
                // Create notifications for all recipients in batch
                const allCalls = batch_recipients.map((followID) => prisma.notifications.create({
                    data: {
                        user_reciever_id: followID,
                        user_sender_id: notificationData.user_sender_id,
                        type: notificationData.type,
                        resource_id: notificationData.resource_id,
                        message: notificationData.message,
                        isRead: false,
                    },
                }));
                yield Promise.all(allCalls);
                return { success: true };
            }
            catch (error) {
                console.error("Error creating notifications:", error);
                throw error;
            }
        }), { connection: this.connection });
        // Set up event handlers for the worker
        this.worker.on("completed", (job) => {
            console.log(`Notification batch job ${job.id} completed`);
        });
        this.worker.on("failed", (job, err) => {
            console.error(`Notification batch job ${job === null || job === void 0 ? void 0 : job.id} failed:`, err);
        });
    }
    addNotification(jobName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // fetch followers id, just want to retrieve id like [1,2,4,8]
            const followers = yield prisma.relationships.findMany({
                where: { follower_id: data.user_sender_id },
                select: {
                    follow_id: true,
                },
            });
            if (followers.length === 0)
                return;
            // group the follower into batches of 50
            const batches = [];
            const batchSize = 50;
            for (let i = 0; i < followers.length; i += batchSize) {
                batches.push(followers.slice(i, i + batchSize));
            }
            console.log("================================================");
            console.log("followers", followers);
            console.log("followers Batches", batches);
            console.log("================================================");
            // send notification to followers
            for (const batch of batches) {
                yield this.queue.add(jobName, Object.assign(Object.assign({}, data), { batch_recipients: batch.map((f) => f.follow_id) }));
            }
        });
    }
    // Add a cleanup method to close connections when shutting down
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.worker.close();
            yield this.queue.close();
            yield this.connection.quit();
        });
    }
}
exports.NotificationManger = NotificationManger;
