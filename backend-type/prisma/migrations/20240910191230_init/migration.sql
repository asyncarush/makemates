/*
  Warnings:

  - You are about to drop the column `posts_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `comments` table. All the data in the column will be lost.
  - The primary key for the `likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `posts_id` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `likes` table. All the data in the column will be lost.
  - Added the required column `post_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_posts1`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_users1`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `fk_likes_posts1`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `fk_likes_users1`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `posts_id`,
    DROP COLUMN `users_id`,
    ADD COLUMN `post_id` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `likes` DROP PRIMARY KEY,
    DROP COLUMN `posts_id`,
    DROP COLUMN `users_id`,
    ADD COLUMN `post_id` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`post_id`, `user_id`);

-- CreateIndex
CREATE INDEX `fk_comments_posts1_idx` ON `comments`(`post_id`);

-- CreateIndex
CREATE INDEX `fk_comments_users1_idx` ON `comments`(`user_id`);

-- CreateIndex
CREATE INDEX `fk_likes_posts1_idx` ON `likes`(`post_id`);

-- CreateIndex
CREATE INDEX `fk_likes_users1_idx` ON `likes`(`user_id`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `fk_comments_posts1` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `fk_comments_users1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `fk_likes_posts1` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `fk_likes_users1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
