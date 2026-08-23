-- Rename the existing review domain in place so IDs, timestamps, and report links survive.
ALTER TABLE "reports"
DROP CONSTRAINT "reports_public_review_id_fkey";

DROP INDEX "reports_public_review_id_idx";
DROP INDEX "public_reviews_one_active_per_user_entry_idx";

ALTER TYPE "public_review_status" RENAME TO "entry_comment_status";
ALTER TYPE "report_resolution_action" RENAME VALUE 'HIDE_REVIEW' TO 'HIDE_COMMENT';
ALTER TYPE "audit_action" RENAME VALUE 'REVIEW_HIDDEN' TO 'COMMENT_HIDDEN';

ALTER TABLE "public_reviews" RENAME TO "entry_comments";
ALTER TABLE "entry_comments" RENAME COLUMN "user_id" TO "author_id";
ALTER TABLE "entry_comments" ADD COLUMN "parent_id" UUID;

ALTER TABLE "reports" RENAME COLUMN "public_review_id" TO "entry_comment_id";

ALTER TABLE "entry_comments"
RENAME CONSTRAINT "public_reviews_pkey" TO "entry_comments_pkey";
ALTER TABLE "entry_comments"
RENAME CONSTRAINT "public_reviews_entry_id_fkey" TO "entry_comments_entry_id_fkey";
ALTER TABLE "entry_comments"
RENAME CONSTRAINT "public_reviews_user_id_fkey" TO "entry_comments_author_id_fkey";
ALTER TABLE "entry_comments"
RENAME CONSTRAINT "public_reviews_hidden_by_id_fkey" TO "entry_comments_hidden_by_id_fkey";

DROP INDEX "public_reviews_entry_id_idx";
DROP INDEX "public_reviews_user_id_idx";
DROP INDEX "public_reviews_status_idx";
DROP INDEX "public_reviews_entry_id_status_idx";
DROP INDEX "public_reviews_user_id_status_idx";
DROP INDEX "public_reviews_created_at_idx";

CREATE INDEX "entry_comments_entry_id_idx" ON "entry_comments"("entry_id");
CREATE INDEX "entry_comments_author_id_idx" ON "entry_comments"("author_id");
CREATE INDEX "entry_comments_parent_id_idx" ON "entry_comments"("parent_id");
CREATE INDEX "entry_comments_status_idx" ON "entry_comments"("status");
CREATE INDEX "entry_comments_entry_id_status_parent_id_created_at_idx"
ON "entry_comments"("entry_id", "status", "parent_id", "created_at");
CREATE INDEX "entry_comments_parent_id_status_created_at_idx"
ON "entry_comments"("parent_id", "status", "created_at");
CREATE INDEX "entry_comments_author_id_status_created_at_idx"
ON "entry_comments"("author_id", "status", "created_at");
CREATE INDEX "entry_comments_created_at_idx" ON "entry_comments"("created_at");

ALTER TABLE "entry_comments"
ADD CONSTRAINT "entry_comments_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "entry_comments"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "reports_entry_comment_id_idx" ON "reports"("entry_comment_id");

ALTER TABLE "reports"
ADD CONSTRAINT "reports_entry_comment_id_fkey"
FOREIGN KEY ("entry_comment_id") REFERENCES "entry_comments"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "comment_likes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "comment_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "comment_likes_user_id_comment_id_key"
ON "comment_likes"("user_id", "comment_id");
CREATE INDEX "comment_likes_user_id_idx" ON "comment_likes"("user_id");
CREATE INDEX "comment_likes_comment_id_idx" ON "comment_likes"("comment_id");
CREATE INDEX "comment_likes_user_id_created_at_idx"
ON "comment_likes"("user_id", "created_at");

ALTER TABLE "comment_likes"
ADD CONSTRAINT "comment_likes_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comment_likes"
ADD CONSTRAINT "comment_likes_comment_id_fkey"
FOREIGN KEY ("comment_id") REFERENCES "entry_comments"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep historical audit metadata aligned with the renamed domain terminology.
UPDATE "audit_logs"
SET "metadata" = ("metadata" - 'reviewId')
  || jsonb_build_object('commentId', "metadata" -> 'reviewId')
WHERE "metadata" ? 'reviewId'
  AND (
    "action" = 'COMMENT_HIDDEN'::"audit_action"
    OR "metadata" ->> 'targetType' = 'REVIEW'
  );

UPDATE "audit_logs"
SET "metadata" = jsonb_set("metadata", '{targetType}', '"COMMENT"'::jsonb)
WHERE "metadata" ->> 'targetType' = 'REVIEW';
