-- Add new ActivityType enum values.
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'OUTCOME_CHANGE';

-- Backfill legacy values (run in a separate statement after the enum value is committed):
-- STATUS_CHANGED → OUTCOME_CHANGE
-- INTERVIEW_OUTCOME → INTERVIEW_SCHEDULED
-- Note: 'OUTCOME' only existed locally and is safe to skip if not present.
