-- DropForeignKey
ALTER TABLE `profileimages` DROP FOREIGN KEY `fk_profile_image_user_id`;

-- AlterTable
ALTER TABLE `profileimages` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AddForeignKey
ALTER TABLE `profileimages` ADD CONSTRAINT `profileimages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
