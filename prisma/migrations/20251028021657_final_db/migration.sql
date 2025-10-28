/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Session_accessToken_key";

-- DropIndex
DROP INDEX "Session_refreshToken_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "accessToken",
DROP COLUMN "expiresAt",
DROP COLUMN "refreshToken";
