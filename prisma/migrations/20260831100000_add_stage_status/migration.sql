-- Add optional sub-status field to Application.
-- Stores the current stage's sub-status (e.g. Scheduled, Passed, Failed)
-- set from the application form when the stage is Screening/Assessment/Interview.
ALTER TABLE "Application" ADD COLUMN "stageStatus" TEXT;
