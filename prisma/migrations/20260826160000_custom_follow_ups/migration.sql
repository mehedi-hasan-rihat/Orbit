-- A follow-up used to be one bare date on the application, so it could say when
-- but never what. This gives it a title and details, and lets an application
-- carry more than one — capped at two open at a time in the server action.
--
-- Application.followUpDate stays, demoted to a mirror of the soonest open row so
-- the list sort, the board and the reminder queries keep working unchanged.
CREATE TABLE "FollowUp" (
    "id"            TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "details"       TEXT,
    "dueAt"         TIMESTAMP(3) NOT NULL,
    "done"          BOOLEAN NOT NULL DEFAULT false,
    "doneAt"        TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FollowUp_applicationId_idx" ON "FollowUp"("applicationId");
CREATE INDEX "FollowUp_applicationId_done_idx" ON "FollowUp"("applicationId", "done");
CREATE INDEX "FollowUp_dueAt_idx" ON "FollowUp"("dueAt");

ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry every existing bare date over as a real follow-up, so nothing that was
-- scheduled quietly stops being chased.
INSERT INTO "FollowUp" ("id", "applicationId", "title", "dueAt", "createdAt", "updatedAt")
SELECT
    'fu_' || substr(md5(random()::text || a."id"), 1, 21),
    a."id",
    'Follow up with ' || a."company",
    a."followUpDate",
    NOW(),
    NOW()
FROM "Application" a
WHERE a."followUpDate" IS NOT NULL;
