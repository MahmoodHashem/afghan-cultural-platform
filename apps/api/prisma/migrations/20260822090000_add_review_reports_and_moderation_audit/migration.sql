ALTER TYPE "report_resolution_action" ADD VALUE 'HIDE_REVIEW';

ALTER TYPE "audit_action" ADD VALUE 'CORRECTION_SUBMITTED';
ALTER TYPE "audit_action" ADD VALUE 'CORRECTION_REJECTED';
ALTER TYPE "audit_action" ADD VALUE 'REPORT_SUBMITTED';
ALTER TYPE "audit_action" ADD VALUE 'REVIEW_HIDDEN';

ALTER TABLE "reports"
ADD COLUMN "public_review_id" UUID;

CREATE INDEX "reports_public_review_id_idx" ON "reports"("public_review_id");

ALTER TABLE "reports"
ADD CONSTRAINT "reports_public_review_id_fkey"
FOREIGN KEY ("public_review_id") REFERENCES "public_reviews"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
