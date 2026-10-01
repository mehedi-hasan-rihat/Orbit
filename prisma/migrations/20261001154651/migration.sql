/*
  Warnings:

  - The values [PENDING] on the enum `StageOutcome` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StageOutcome_new" AS ENUM ('SCHEDULED', 'ASSIGNED', 'COMPLETED', 'PASSED', 'FAILED', 'CANCELLED');
ALTER TABLE "Application" ALTER COLUMN "stageOutcome" TYPE "StageOutcome_new" USING ("stageOutcome"::text::"StageOutcome_new");
ALTER TYPE "StageOutcome" RENAME TO "StageOutcome_old";
ALTER TYPE "StageOutcome_new" RENAME TO "StageOutcome";
DROP TYPE "public"."StageOutcome_old";
COMMIT;
