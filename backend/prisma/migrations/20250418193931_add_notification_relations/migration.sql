-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_reciever_id" INTEGER NOT NULL,
    "user_sender_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_receiver_id_idx" ON "notifications"("user_reciever_id");

-- CreateIndex
CREATE INDEX "notifications_sender_id_idx" ON "notifications"("user_sender_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_reciever_id_fkey" FOREIGN KEY ("user_reciever_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_sender_id_fkey" FOREIGN KEY ("user_sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
