CREATE TYPE "entry_revision_status" AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'CHANGES_REQUESTED',
  'REJECTED',
  'APPROVED',
  'CANCELLED'
);

ALTER TYPE "version_reason" ADD VALUE 'PUBLISHED_REVISION';

ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_STARTED';
ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_REQUESTED';
ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_SUBMITTED';
ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_APPROVED';
ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_CHANGES_REQUESTED';
ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_REJECTED';
ALTER TYPE "audit_action" ADD VALUE 'ENTRY_REVISION_CANCELLED';

CREATE TABLE "entry_revisions" (
  "id" UUID NOT NULL,
  "entry_id" UUID NOT NULL,
  "status" "entry_revision_status" NOT NULL DEFAULT 'DRAFT',
  "base_version_id" UUID,
  "working_snapshot" JSONB NOT NULL,
  "plain_text_content" TEXT NOT NULL,
  "created_by_id" UUID NOT NULL,
  "requested_by_id" UUID,
  "request_feedback" TEXT,
  "submitted_at" TIMESTAMPTZ(3),
  "decided_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "entry_revisions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "cultural_entries" ADD COLUMN "published_version_id" UUID;
ALTER TABLE "content_versions" ADD COLUMN "entry_revision_id" UUID;
ALTER TABLE "moderation_reviews"
  ADD COLUMN "entry_revision_id" UUID,
  ADD COLUMN "previous_revision_status" "entry_revision_status",
  ADD COLUMN "next_revision_status" "entry_revision_status";
ALTER TABLE "images" ADD COLUMN "entry_revision_id" UUID;
ALTER TABLE "audit_logs" ADD COLUMN "entry_revision_id" UUID;

CREATE UNIQUE INDEX "cultural_entries_published_version_id_key"
  ON "cultural_entries"("published_version_id");
CREATE INDEX "content_versions_entry_revision_id_idx" ON "content_versions"("entry_revision_id");
CREATE INDEX "entry_revisions_entry_id_idx" ON "entry_revisions"("entry_id");
CREATE INDEX "entry_revisions_status_idx" ON "entry_revisions"("status");
CREATE INDEX "entry_revisions_created_by_id_idx" ON "entry_revisions"("created_by_id");
CREATE INDEX "entry_revisions_requested_by_id_idx" ON "entry_revisions"("requested_by_id");
CREATE INDEX "entry_revisions_submitted_at_idx" ON "entry_revisions"("submitted_at");
CREATE UNIQUE INDEX "entry_revisions_one_active_per_entry_idx"
  ON "entry_revisions"("entry_id")
  WHERE "status" IN ('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'REJECTED');
CREATE INDEX "moderation_reviews_entry_revision_id_idx" ON "moderation_reviews"("entry_revision_id");
CREATE INDEX "images_entry_revision_id_idx" ON "images"("entry_revision_id");
CREATE INDEX "audit_logs_entry_revision_id_idx" ON "audit_logs"("entry_revision_id");

ALTER TABLE "entry_revisions"
  ADD CONSTRAINT "entry_revisions_entry_id_fkey"
  FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "entry_revisions"
  ADD CONSTRAINT "entry_revisions_base_version_id_fkey"
  FOREIGN KEY ("base_version_id") REFERENCES "content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "entry_revisions"
  ADD CONSTRAINT "entry_revisions_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "entry_revisions"
  ADD CONSTRAINT "entry_revisions_requested_by_id_fkey"
  FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cultural_entries"
  ADD CONSTRAINT "cultural_entries_published_version_id_fkey"
  FOREIGN KEY ("published_version_id") REFERENCES "content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_versions"
  ADD CONSTRAINT "content_versions_entry_revision_id_fkey"
  FOREIGN KEY ("entry_revision_id") REFERENCES "entry_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "moderation_reviews"
  ADD CONSTRAINT "moderation_reviews_entry_revision_id_fkey"
  FOREIGN KEY ("entry_revision_id") REFERENCES "entry_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "images"
  ADD CONSTRAINT "images_entry_revision_id_fkey"
  FOREIGN KEY ("entry_revision_id") REFERENCES "entry_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_entry_revision_id_fkey"
  FOREIGN KEY ("entry_revision_id") REFERENCES "entry_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

WITH latest_versions AS (
  SELECT DISTINCT ON ("entry_id") "entry_id", "id"
  FROM "content_versions"
  ORDER BY "entry_id", "version_number" DESC
)
UPDATE "cultural_entries" AS entry
SET "published_version_id" = latest."id"
FROM latest_versions AS latest
WHERE entry."status" IN ('PUBLISHED', 'HIDDEN', 'ARCHIVED')
  AND latest."entry_id" = entry."id"
  AND entry."published_version_id" IS NULL;
