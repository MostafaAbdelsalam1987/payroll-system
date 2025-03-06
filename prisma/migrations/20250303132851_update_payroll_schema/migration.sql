/*
  Warnings:

  - You are about to drop the column `month` on the `payroll` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `payroll` table. All the data in the column will be lost.
  - Added the required column `clientBranchId` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientPaid` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodFrom` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodTo` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payroll` DROP COLUMN `month`,
    DROP COLUMN `year`,
    ADD COLUMN `clientBranchId` INTEGER NOT NULL,
    ADD COLUMN `clientPaid` BOOLEAN NOT NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `periodFrom` DATETIME(3) NOT NULL,
    ADD COLUMN `periodTo` DATETIME(3) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'قيد المراجعة';

-- CreateTable
CREATE TABLE `PayrollReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payrollId` INTEGER NOT NULL,
    `reviewerId` INTEGER NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `comments` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_clientBranchId_fkey` FOREIGN KEY (`clientBranchId`) REFERENCES `ClientBranch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollReview` ADD CONSTRAINT `PayrollReview_payrollId_fkey` FOREIGN KEY (`payrollId`) REFERENCES `Payroll`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollReview` ADD CONSTRAINT `PayrollReview_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
