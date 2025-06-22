-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Randevu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tarih" DATETIME NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',
    "aciklama" TEXT,
    "userId" INTEGER NOT NULL,
    "hizmetId" INTEGER,
    CONSTRAINT "Randevu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Randevu_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Randevu" ("aciklama", "hizmetId", "id", "tarih", "userId") SELECT "aciklama", "hizmetId", "id", "tarih", "userId" FROM "Randevu";
DROP TABLE "Randevu";
ALTER TABLE "new_Randevu" RENAME TO "Randevu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
