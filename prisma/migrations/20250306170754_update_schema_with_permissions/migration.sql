-- CreateTable
CREATE TABLE `UserPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `canManageUsers` BOOLEAN NOT NULL DEFAULT false,
    `canManagePayrolls` BOOLEAN NOT NULL DEFAULT false,
    `canManageInvoices` BOOLEAN NOT NULL DEFAULT false,
    `canManageClients` BOOLEAN NOT NULL DEFAULT false,
    `canManageBranches` BOOLEAN NOT NULL DEFAULT false,
    `canManageSettings` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `UserPermission_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
