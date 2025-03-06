/*
  Warnings:

  - A unique constraint covering the columns `[commercialRegistration]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[taxNumber]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activity` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commercialRegistration` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxNumber` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `client` ADD COLUMN `activity` VARCHAR(191) NOT NULL,
    ADD COLUMN `commercialRegistration` VARCHAR(191) NOT NULL,
    ADD COLUMN `taxNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Client_commercialRegistration_key` ON `Client`(`commercialRegistration`);

-- CreateIndex
CREATE UNIQUE INDEX `Client_taxNumber_key` ON `Client`(`taxNumber`);
