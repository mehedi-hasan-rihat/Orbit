-- Add stageScheduledAt to Application: optional datetime for when the current
-- stage step (e.g. a Screening call) is scheduled. Used for email reminders
-- and shown in the activity timeline.
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "stageScheduledAt" TIMESTAMP(3);
