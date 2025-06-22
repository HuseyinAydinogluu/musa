-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sifre" TEXT NOT NULL,
    "rol" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Profil" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bio" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Profil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Randevu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tarih" DATETIME NOT NULL,
    "aciklama" TEXT,
    "userId" INTEGER NOT NULL,
    "hizmetId" INTEGER NOT NULL,
    CONSTRAINT "Randevu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Randevu_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hizmet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "fiyat" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Mesaj" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "icerik" TEXT NOT NULL,
    "gonderenId" INTEGER NOT NULL,
    "aliciId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mesaj_gonderenId_fkey" FOREIGN KEY ("gonderenId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mesaj_aliciId_fkey" FOREIGN KEY ("aliciId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profil_userId_key" ON "Profil"("userId");
