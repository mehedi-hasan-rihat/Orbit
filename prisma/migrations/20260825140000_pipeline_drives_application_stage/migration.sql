-- The pipeline becomes the application's stage, replacing ApplicationStatus.
--
-- Care is taken not to clobber curation: users who have already edited their
-- pipeline (renamed, deleted, or added types) get only the lifecycle stages
-- their applications actually need, never a re-seed of types they deleted.

CREATE TYPE "StageCategory" AS ENUM ('OPEN', 'INTERVIEWING', 'SUCCESS', 'CLOSED');

ALTER TABLE "PipelineStageType"
    ADD COLUMN "color" TEXT NOT NULL DEFAULT '#6b7280',
    ADD COLUMN "category" "StageCategory" NOT NULL DEFAULT 'INTERVIEWING';

ALTER TABLE "Application" ADD COLUMN "stageId" TEXT;

-- ── Categorise and colour the stage types that already exist ────────────────
UPDATE "PipelineStageType" SET category = 'SUCCESS', color = '#22c55e' WHERE name = 'Offer';
UPDATE "PipelineStageType" SET color = '#a855f7' WHERE name = 'Screening';
UPDATE "PipelineStageType" SET color = '#f59e0b' WHERE name = 'Interview';
UPDATE "PipelineStageType" SET color = '#0ea5e9' WHERE name = 'Technical Interview';
UPDATE "PipelineStageType" SET color = '#ec4899' WHERE name = 'HR';
UPDATE "PipelineStageType" SET color = '#14b8a6' WHERE name = 'Assessment';
-- Anything else keeps the INTERVIEWING default: a custom type added to an
-- interview pipeline sits mid-funnel.

-- ── Branch A: users who already have a curated pipeline ─────────────────────
-- Add only the stages needed to represent an ApplicationStatus. Interview-only
-- defaults (Technical Interview, HR, Assessment) are NOT re-added — if the user
-- deleted them, that was deliberate.
INSERT INTO "PipelineStageType" ("id", "userId", "name", "color", "category", "order", "enabled", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    u.id, d.name, d.color, d.category::"StageCategory", d.ord, d.enabled, NOW(), NOW()
FROM "User" u
CROSS JOIN (VALUES
    ('Wishlist',  '#6b7280', 'OPEN',         -2, true),
    ('Applied',   '#3b82f6', 'OPEN',         -1, true),
    ('Screening', '#a855f7', 'INTERVIEWING',  0, true),
    ('Interview', '#f59e0b', 'INTERVIEWING',  1, true),
    ('Offer',     '#22c55e', 'SUCCESS',       5, true),
    ('Rejected',  '#ef4444', 'CLOSED',      100, true),
    ('Withdrawn', '#f97316', 'CLOSED',      101, false),
    ('Archived',  '#64748b', 'CLOSED',      102, false)
) AS d(name, color, category, ord, enabled)
WHERE EXISTS (SELECT 1 FROM "PipelineStageType" p WHERE p."userId" = u.id)
ON CONFLICT ("userId", "name") DO NOTHING;

-- ── Branch B: users who have never opened the pipeline page ─────────────────
-- Seed the full default catalogue, lifecycle plus interview stages.
INSERT INTO "PipelineStageType" ("id", "userId", "name", "color", "category", "order", "enabled", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    u.id, d.name, d.color, d.category::"StageCategory", d.ord, d.enabled, NOW(), NOW()
FROM "User" u
CROSS JOIN (VALUES
    ('Wishlist',            '#6b7280', 'OPEN',         0, true),
    ('Applied',             '#3b82f6', 'OPEN',         1, true),
    ('Screening',           '#a855f7', 'INTERVIEWING', 2, true),
    ('Interview',           '#f59e0b', 'INTERVIEWING', 3, true),
    ('Technical Interview', '#0ea5e9', 'INTERVIEWING', 4, true),
    ('HR',                  '#ec4899', 'INTERVIEWING', 5, true),
    ('Assessment',          '#14b8a6', 'INTERVIEWING', 6, true),
    ('Offer',               '#22c55e', 'SUCCESS',      7, true),
    ('Rejected',            '#ef4444', 'CLOSED',       8, true),
    ('Withdrawn',           '#f97316', 'CLOSED',       9, false),
    ('Archived',            '#64748b', 'CLOSED',      10, false)
) AS d(name, color, category, ord, enabled)
WHERE NOT EXISTS (SELECT 1 FROM "PipelineStageType" p WHERE p."userId" = u.id)
ON CONFLICT ("userId", "name") DO NOTHING;

-- ── Backfill every application onto its matching stage ──────────────────────
UPDATE "Application" a
SET "stageId" = p.id
FROM "PipelineStageType" p
WHERE p."userId" = a."userId"
  AND p.name = CASE a.status
      WHEN 'WISHLIST'  THEN 'Wishlist'
      WHEN 'APPLIED'   THEN 'Applied'
      WHEN 'SCREENING' THEN 'Screening'
      WHEN 'INTERVIEW' THEN 'Interview'
      WHEN 'OFFER'     THEN 'Offer'
      WHEN 'REJECTED'  THEN 'Rejected'
      WHEN 'WITHDRAWN' THEN 'Withdrawn'
      WHEN 'ARCHIVED'  THEN 'Archived'
  END;

-- The enum column stops being written. It stays as a rendering fallback for any
-- row the backfill could not match, and the enum type itself is left intact.
ALTER TABLE "Application" ALTER COLUMN "status" DROP NOT NULL;
ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;

DROP INDEX IF EXISTS "Application_userId_status_idx";
CREATE INDEX "Application_userId_stageId_idx" ON "Application"("userId", "stageId");

ALTER TABLE "Application" ADD CONSTRAINT "Application_stageId_fkey"
    FOREIGN KEY ("stageId") REFERENCES "PipelineStageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
