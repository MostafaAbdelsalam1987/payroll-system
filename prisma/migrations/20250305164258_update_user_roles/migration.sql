/*
  Warnings:

  - You are about to alter the column `role` on the `payrollreview` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_userchatgroups` DROP FOREIGN KEY `_UserChatGroups_B_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `payroll` DROP FOREIGN KEY `Payroll_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `payrollreview` DROP FOREIGN KEY `PayrollReview_reviewerId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_companyBranchId_fkey`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `message`;

-- DropIndex
DROP INDEX `Notification_userId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Payroll_employeeId_fkey` ON `payroll`;

-- DropIndex
DROP INDEX `PayrollReview_reviewerId_fkey` ON `payrollreview`;

-- AlterTable
ALTER TABLE `client` MODIFY `additionalNotes` VARCHAR(191) NULL DEFAULT '',
    MODIFY `address` VARCHAR(191) NULL DEFAULT '',
    MODIFY `city` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `payrollreview` MODIFY `role` ENUM('employee', 'accountant', 'finance_manager', 'company_manager', 'admin') NOT NULL;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameAr` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('employee', 'accountant', 'finance_manager', 'company_manager', 'admin') NOT NULL,
    `isActivated` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `companyBranchId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyBranchId_fkey` FOREIGN KEY (`companyBranchId`) REFERENCES `CompanyBranch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollReview` ADD CONSTRAINT `PayrollReview_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserChatGroups` ADD CONSTRAINT `_UserChatGroups_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
