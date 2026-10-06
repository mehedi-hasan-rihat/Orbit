/*
  Warnings:

  - You are about to drop the column `stageScheduledAt` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "stageScheduledAt",
ADD COLUMN     "stageDueAt" TIMESTAMP(3);
