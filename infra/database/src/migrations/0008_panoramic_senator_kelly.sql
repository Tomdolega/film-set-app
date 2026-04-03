ALTER TABLE "documents" ADD COLUMN "original_filename" text;

UPDATE "documents"
SET "original_filename" = COALESCE(NULLIF("name", ''), 'document')
WHERE "original_filename" IS NULL;

ALTER TABLE "documents" ALTER COLUMN "original_filename" SET NOT NULL;
