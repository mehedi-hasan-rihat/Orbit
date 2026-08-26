-- Customizable interview pipeline.
--
-- Additive only. Pre-rework Interview rows keep their "type"/"customType"
-- values and render through the legacy fallback in resolveStageLabel(); they
-- are migrated forward individually the next time a user edits them.

-- Per-user catalogue of stage types.
CREATE TABLE "PipelineStageType" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineStageType_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PipelineStageType_userId_idx" ON "PipelineStageType"("userId");
CREATE UNIQUE INDEX "PipelineStageType_userId_name_key" ON "PipelineStageType"("userId", "name");

ALTER TABLE "PipelineStageType" ADD CONSTRAINT "PipelineStageType_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Interview points at a user-owned stage type; the old enum becomes legacy.
ALTER TABLE "Interview" ADD COLUMN "stageTypeId" TEXT;
ALTER TABLE "Interview" ALTER COLUMN "type" DROP NOT NULL;

CREATE INDEX "Interview_stageTypeId_idx" ON "Interview"("stageTypeId");

ALTER TABLE "Interview" ADD CONSTRAINT "Interview_stageTypeId_fkey"
    FOREIGN KEY ("stageTypeId") REFERENCES "PipelineStageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Dead column: declared in the schema but never read or written by any code,
-- and NULL for every existing row.
ALTER TABLE "User" DROP COLUMN "pipelineStages";
