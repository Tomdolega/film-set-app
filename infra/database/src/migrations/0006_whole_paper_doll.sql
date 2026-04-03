ALTER TABLE "shooting_days" ADD COLUMN "title" text;

UPDATE "shooting_days"
SET "title" = COALESCE(NULLIF("location", ''), 'Untitled shooting day')
WHERE "title" IS NULL;

ALTER TABLE "shooting_days" ALTER COLUMN "title" SET NOT NULL;
