-- Create the Note table
CREATE TABLE IF NOT EXISTS "Note" (
  "id"            TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "content"       TEXT NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Note_applicationId_idx" ON "Note"("applicationId");
CREATE INDEX IF NOT EXISTS "Note_applicationId_createdAt_idx" ON "Note"("applicationId", "createdAt");

ALTER TABLE "Note"
  ADD CONSTRAINT "Note_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Migrate legacy notes strings ────────────────────────────────────────────
-- The legacy format is a free-form string, sometimes with one or more entries
-- that look like:  [9/24/2026] some text
-- Strategy:
--   1. Split on the pattern \n\n[date] to find boundaries.
--   2. Each chunk that starts with [date] gets that date as createdAt; the
--      rest of the text is the content.
--   3. Any leading chunk that has no [date] prefix is treated as a single
--      note created at the application's createdAt time.
--
-- We do this in a PL/pgSQL block so it runs as part of the migration.

DO $$
DECLARE
  rec      RECORD;
  raw      TEXT;
  chunks   TEXT[];
  chunk    TEXT;
  dt_match TEXT;
  dt_val   TIMESTAMP(3);
  body     TEXT;
  note_id  TEXT;
BEGIN
  FOR rec IN
    SELECT id, notes, "createdAt"
    FROM "Application"
    WHERE notes IS NOT NULL AND notes <> ''
  LOOP
    raw := rec.notes;

    -- Split on double-newline boundaries that precede a [date] marker.
    -- regexp_split_to_array splits on the separator; we keep the separator
    -- attached to the following chunk via a lookahead workaround:
    -- split on '\n\n(?=\[)', then prepend nothing for the first chunk.
    chunks := regexp_split_to_array(raw, E'\\n\\n(?=\\[)');

    FOREACH chunk IN ARRAY chunks LOOP
      chunk := btrim(chunk);
      CONTINUE WHEN chunk = '';

      -- Try to parse a leading [M/D/YYYY] date stamp.
      dt_match := (regexp_match(chunk, E'^\\[(\\d{1,2}/\\d{1,2}/\\d{4})\\]'))[1];

      IF dt_match IS NOT NULL THEN
        BEGIN
          dt_val := to_timestamp(dt_match, 'MM/DD/YYYY');
        EXCEPTION WHEN OTHERS THEN
          dt_val := rec."createdAt";
        END;
        -- Strip the [date] prefix and optional leading space/newline.
        body := btrim(regexp_replace(chunk, E'^\\[\\d{1,2}/\\d{1,2}/\\d{4}\\]\\s*', ''));
      ELSE
        dt_val := rec."createdAt";
        body   := chunk;
      END IF;

      CONTINUE WHEN body = '';

      -- Generate a cuid-compatible random id (good enough for a migration).
      note_id := 'legacy_' || replace(gen_random_uuid()::text, '-', '');

      INSERT INTO "Note" ("id", "applicationId", "content", "createdAt", "updatedAt")
      VALUES (note_id, rec.id, body, dt_val, dt_val)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;
