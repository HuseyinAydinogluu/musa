-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bildirim" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "icerik" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bildirim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bildirim" ("createdAt", "icerik", "id", "userId") SELECT "createdAt", "icerik", "id", "userId" FROM "Bildirim";
DROP TABLE "Bildirim";
ALTER TABLE "new_Bildirim" RENAME TO "Bildirim";
CREATE TABLE "new_Mesaj" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "icerik" TEXT NOT NULL,
    "gonderenId" INTEGER NOT NULL,
    "aliciId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mesaj_gonderenId_fkey" FOREIGN KEY ("gonderenId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mesaj_aliciId_fkey" FOREIGN KEY ("aliciId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mesaj" ("aliciId", "createdAt", "gonderenId", "icerik", "id") SELECT "aliciId", "createdAt", "gonderenId", "icerik", "id" FROM "Mesaj";
DROP TABLE "Mesaj";
ALTER TABLE "new_Mesaj" RENAME TO "Mesaj";
CREATE TABLE "new_Profil" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bio" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Profil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profil" ("bio", "id", "userId") SELECT "bio", "id", "userId" FROM "Profil";
DROP TABLE "Profil";
ALTER TABLE "new_Profil" RENAME TO "Profil";
CREATE UNIQUE INDEX "Profil_userId_key" ON "Profil"("userId");
CREATE TABLE "new_Randevu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tarih" DATETIME NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',
    "aciklama" TEXT,
    "userId" INTEGER NOT NULL,
    "hizmetId" INTEGER,
    CONSTRAINT "Randevu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Randevu_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Randevu" ("aciklama", "durum", "hizmetId", "id", "tarih", "userId") SELECT "aciklama", "durum", "hizmetId", "id", "tarih", "userId" FROM "Randevu";
DROP TABLE "Randevu";
ALTER TABLE "new_Randevu" RENAME TO "Randevu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
