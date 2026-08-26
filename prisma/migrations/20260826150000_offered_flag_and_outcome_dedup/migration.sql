-- Getting an offer, and being rejected, are endings — not places in the
-- pipeline. Modelling them as stages meant an application could only be "at
-- Offer" by leaving the stage it actually reached, and it put two rows in the
-- user's own stage catalogue that they could never delete.
--
-- `offered` mirrors `closed`: a flag on the application that leaves stageId,
-- notes, tags and rounds exactly as they were. Unlike `closed` it does not end
-- anything — an offer you have not answered yet is still live.
ALTER TABLE "Application" ADD COLUMN "offered" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Application" ADD COLUMN "offeredAt" TIMESTAMP(3);

CREATE INDEX "Application_userId_offered_idx" ON "Application"("userId", "offered");

-- Backfill from the stages that used to carry the meaning. Nothing moves: the
-- rows keep the stage they are in, they just gain the flag that now records the
-- outcome. Offer/Rejected stages themselves are left alone — they belong to the
-- user, they are simply no longer seeded or locked.
UPDATE "Application" a
SET "offered" = true,
    "offeredAt" = COALESCE(a."updatedAt", a."createdAt")
FROM "PipelineStageType" s
WHERE a."stageId" = s."id"
  AND s."category" = 'SUCCESS'
  AND a."offered" = false;

UPDATE "Application" a
SET "closed" = true,
    "closedAt" = COALESCE(a."closedAt", a."updatedAt", a."createdAt")
FROM "PipelineStageType" s
WHERE a."stageId" = s."id"
  AND s."category" = 'CLOSED'
  AND a."closed" = false;

-- Outcome vocabulary deduplicated. REJECTED and WITHDRAWN described how the
-- *application* ended, duplicating FAILED/CANCELLED at the round level — and
-- now duplicating the flags above. Interview.outcome is a plain text column, so
-- this is a data change only.
UPDATE "Interview" SET "outcome" = 'FAILED'    WHERE "outcome" = 'REJECTED';
UPDATE "Interview" SET "outcome" = 'CANCELLED' WHERE "outcome" = 'WITHDRAWN';
