/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiredAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");
