-- AlterTable
ALTER TABLE `payroll` ADD COLUMN `transferAmount` DECIMAL(65, 30) NULL,
    ADD COLUMN `transferDate` DATETIME(3) NULL;
