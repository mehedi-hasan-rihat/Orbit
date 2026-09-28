/*
  Warnings:

  - The values [INTERVIEW_SCHEDULED] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('CREATED', 'OUTCOME_CHANGE', 'NOTE_ADDED', 'REMINDER_SET', 'OTHER');
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_stageTypeId_fkey";

-- DropTable
DROP TABLE "Interview";
