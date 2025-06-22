-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `sifre` VARCHAR(191) NOT NULL,
    `rol` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profil` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bio` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Profil_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Randevu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tarih` DATETIME(3) NOT NULL,
    `durum` VARCHAR(191) NOT NULL DEFAULT 'bekliyor',
    `aciklama` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `hizmetId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mesaj` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `icerik` VARCHAR(191) NOT NULL,
    `gonderenId` INTEGER NOT NULL,
    `aliciId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bildirim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `icerik` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hizmet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad` VARCHAR(191) NOT NULL,
    `fiyat` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profil` ADD CONSTRAINT `Profil_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Randevu` ADD CONSTRAINT `Randevu_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Randevu` ADD CONSTRAINT `Randevu_hizmetId_fkey` FOREIGN KEY (`hizmetId`) REFERENCES `Hizmet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mesaj` ADD CONSTRAINT `Mesaj_gonderenId_fkey` FOREIGN KEY (`gonderenId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mesaj` ADD CONSTRAINT `Mesaj_aliciId_fkey` FOREIGN KEY (`aliciId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bildirim` ADD CONSTRAINT `Bildirim_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
