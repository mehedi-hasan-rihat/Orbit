-- Closing an application ends the process while preserving every other field,
-- most importantly stageId: unlike moving a card to a CLOSED-category stage,
-- closing keeps the stage it actually died at.
ALTER TABLE "Application" ADD COLUMN "closed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Application" ADD COLUMN "closedAt" TIMESTAMP(3);

CREATE INDEX "Application_userId_closed_idx" ON "Application"("userId", "closed");
