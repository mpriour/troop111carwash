-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsor" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "sponsorUrl" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2022,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
