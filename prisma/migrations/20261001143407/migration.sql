/*
  Warnings:

  - The `stageOutcome` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StageOutcome" AS ENUM ('PENDING', 'SCHEDULED', 'ASSIGNED', 'COMPLETED', 'PASSED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "stageOutcome",
ADD COLUMN     "stageOutcome" "StageOutcome";
