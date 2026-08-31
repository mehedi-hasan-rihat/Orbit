-- Backfill legacy ActivityType values to their new names.
-- STATUS_CHANGED → OUTCOME_CHANGE
UPDATE "Activity" SET "type" = 'OUTCOME_CHANGE' WHERE "type" = 'STATUS_CHANGED';

-- INTERVIEW_OUTCOME → INTERVIEW_SCHEDULED
UPDATE "Activity" SET "type" = 'INTERVIEW_SCHEDULED' WHERE "type" = 'INTERVIEW_OUTCOME';
