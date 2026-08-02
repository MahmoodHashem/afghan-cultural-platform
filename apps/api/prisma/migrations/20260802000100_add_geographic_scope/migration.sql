-- CreateEnum
CREATE TYPE "geographic_scope" AS ENUM ('PROVINCE', 'NATIONAL', 'NONE');

-- AddColumn
ALTER TABLE "cultural_entries"
ADD COLUMN "geographic_scope" "geographic_scope";

-- Backfill
UPDATE "cultural_entries"
SET "geographic_scope" = CASE
  WHEN "province_id" IS NOT NULL THEN 'PROVINCE'::"geographic_scope"
  ELSE 'NONE'::"geographic_scope"
END;

-- Make geographic_scope required after backfill.
ALTER TABLE "cultural_entries"
ALTER COLUMN "geographic_scope" SET NOT NULL,
ALTER COLUMN "geographic_scope" SET DEFAULT 'PROVINCE';

-- Allow national and non-geographic entries to have no province.
ALTER TABLE "cultural_entries"
ALTER COLUMN "province_id" DROP NOT NULL;

-- Enforce the simplified v1 geography rules at the database layer too.
ALTER TABLE "cultural_entries"
ADD CONSTRAINT "cultural_entries_geographic_scope_location_check"
CHECK (
  (
    "geographic_scope" = 'PROVINCE'
    AND "province_id" IS NOT NULL
  )
  OR (
    "geographic_scope" IN ('NATIONAL', 'NONE')
    AND "province_id" IS NULL
    AND "district_id" IS NULL
  )
);

-- CreateIndex
CREATE INDEX "cultural_entries_geographic_scope_idx" ON "cultural_entries"("geographic_scope");

-- CreateIndex
CREATE INDEX "cultural_entries_geographic_scope_province_id_idx" ON "cultural_entries"("geographic_scope", "province_id");
