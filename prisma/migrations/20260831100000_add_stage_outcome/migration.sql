-- Add stageOutcome column to Application.
-- Stores the outcome for the current stage (e.g. Scheduled, Passed, Failed).
-- Originally added as stageStatus then renamed to stageOutcome.
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "stageOutcome" TEXT;
