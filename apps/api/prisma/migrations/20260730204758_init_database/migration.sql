-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "entry_status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "version_reason" AS ENUM ('INITIAL_SUBMISSION', 'RESUBMISSION', 'ACCEPTED_CORRECTION', 'ADMIN_UPDATE');

-- CreateEnum
CREATE TYPE "moderation_decision" AS ENUM ('APPROVE', 'REQUEST_CHANGES', 'REJECT', 'HIDE', 'RESTORE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "correction_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED');

-- CreateEnum
CREATE TYPE "report_reason" AS ENUM ('INACCURATE_INFORMATION', 'OFFENSIVE_OR_DISCRIMINATORY_CONTENT', 'COPYRIGHT_PROBLEM', 'PRIVACY_PROBLEM', 'INCORRECT_PROVINCE_OR_CATEGORY', 'DUPLICATE_CONTENT', 'MISSING_OR_MISLEADING_SOURCE', 'CULTURALLY_SENSITIVE_CONTENT', 'INVALID_YOUTUBE_LINK', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "report_resolution_action" AS ENUM ('DISMISS', 'HIDE_CONTENT', 'REQUEST_CORRECTIONS', 'REMOVE_IMAGE', 'REMOVE_YOUTUBE_VIDEO', 'ARCHIVE_CONTENT', 'ESCALATE_TO_ADMIN');

-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('BOOK', 'ACADEMIC_ARTICLE', 'WEBSITE', 'ARCHIVE', 'INTERVIEW', 'ORAL_SOURCE', 'PERSONAL_EXPERIENCE', 'MUSEUM_OR_INSTITUTION', 'OTHER');

-- CreateEnum
CREATE TYPE "public_review_status" AS ENUM ('ACTIVE', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('ENTRY_SUBMITTED', 'ENTRY_APPROVED', 'ENTRY_REJECTED', 'ENTRY_CHANGES_REQUESTED', 'ENTRY_HIDDEN', 'ENTRY_RESTORED', 'CORRECTION_ACCEPTED', 'REPORT_RESOLVED', 'USER_ROLE_CHANGED', 'USER_SUSPENDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "display_name" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "biography" TEXT,
    "province_id" UUID,
    "cultural_interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "email_verified_at" TIMESTAMPTZ(3),
    "last_login_at" TIMESTAMPTZ(3),
    "suspended_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultural_entries" (
    "id" UUID NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content_json" JSONB NOT NULL,
    "plain_text_content" TEXT NOT NULL,
    "normalized_search_text" TEXT NOT NULL DEFAULT '',
    "status" "entry_status" NOT NULL DEFAULT 'DRAFT',
    "author_id" UUID NOT NULL,
    "province_id" UUID NOT NULL,
    "district_id" UUID,
    "category_id" UUID NOT NULL,
    "content_type_id" UUID NOT NULL,
    "village_or_location" TEXT,
    "historical_period" TEXT,
    "cultural_community" TEXT,
    "alternative_local_name" TEXT,
    "regional_differences" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "last_rated_at" TIMESTAMPTZ(3),
    "submitted_at" TIMESTAMPTZ(3),
    "published_at" TIMESTAMPTZ(3),
    "hidden_at" TIMESTAMPTZ(3),
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "cultural_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "plain_text_content" TEXT NOT NULL,
    "version_reason" "version_reason" NOT NULL,
    "created_by_id" UUID,
    "correction_suggestion_id" UUID,
    "moderation_review_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_reviews" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "moderator_id" UUID NOT NULL,
    "decision" "moderation_decision" NOT NULL,
    "comments" TEXT,
    "previous_status" "entry_status" NOT NULL,
    "next_status" "entry_status" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" UUID NOT NULL,
    "province_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_tags" (
    "entry_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entry_tags_pkey" PRIMARY KEY ("entry_id","tag_id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "uploaded_by_id" UUID,
    "cloudinary_public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "bytes" INTEGER,
    "caption" TEXT,
    "alt_text" TEXT NOT NULL,
    "photographer_or_source" TEXT,
    "permission_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_removed" BOOLEAN NOT NULL DEFAULT false,
    "removed_by_id" UUID,
    "removed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_videos" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "video_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "is_removed" BOOLEAN NOT NULL DEFAULT false,
    "removed_by_id" UUID,
    "removed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "youtube_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "type" "source_type" NOT NULL,
    "title" TEXT,
    "author_or_provider" TEXT,
    "publication_date" TEXT,
    "website_url" TEXT,
    "book_or_article_details" TEXT,
    "interview_date" TIMESTAMPTZ(3),
    "explanation" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "value" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_reviews" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "status" "public_review_status" NOT NULL DEFAULT 'ACTIVE',
    "hidden_by_id" UUID,
    "hidden_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "public_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction_suggestions" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "submitted_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "status" "correction_status" NOT NULL DEFAULT 'PENDING',
    "section" TEXT NOT NULL,
    "proposed_correction" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "source_text" TEXT,
    "reviewer_comments" TEXT,
    "accepted_version_id" UUID,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "correction_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "reported_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "reason" "report_reason" NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "report_status" NOT NULL DEFAULT 'OPEN',
    "resolution_action" "report_resolution_action",
    "resolution_notes" TEXT,
    "resolved_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "replaced_by_id" UUID,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "action" "audit_action" NOT NULL,
    "actor_id" UUID,
    "target_user_id" UUID,
    "entry_id" UUID,
    "report_id" UUID,
    "correction_suggestion_id" UUID,
    "metadata" JSONB,
    "request_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_province_id_idx" ON "users"("province_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cultural_entries_slug_key" ON "cultural_entries"("slug");

-- CreateIndex
CREATE INDEX "cultural_entries_status_idx" ON "cultural_entries"("status");

-- CreateIndex
CREATE INDEX "cultural_entries_province_id_idx" ON "cultural_entries"("province_id");

-- CreateIndex
CREATE INDEX "cultural_entries_district_id_idx" ON "cultural_entries"("district_id");

-- CreateIndex
CREATE INDEX "cultural_entries_category_id_idx" ON "cultural_entries"("category_id");

-- CreateIndex
CREATE INDEX "cultural_entries_content_type_id_idx" ON "cultural_entries"("content_type_id");

-- CreateIndex
CREATE INDEX "cultural_entries_author_id_idx" ON "cultural_entries"("author_id");

-- CreateIndex
CREATE INDEX "cultural_entries_published_at_idx" ON "cultural_entries"("published_at");

-- CreateIndex
CREATE INDEX "cultural_entries_created_at_idx" ON "cultural_entries"("created_at");

-- CreateIndex
CREATE INDEX "cultural_entries_normalized_search_text_idx" ON "cultural_entries"("normalized_search_text");

-- CreateIndex
CREATE INDEX "cultural_entries_status_published_at_idx" ON "cultural_entries"("status", "published_at");

-- CreateIndex
CREATE INDEX "cultural_entries_status_province_id_idx" ON "cultural_entries"("status", "province_id");

-- CreateIndex
CREATE INDEX "cultural_entries_status_category_id_idx" ON "cultural_entries"("status", "category_id");

-- CreateIndex
CREATE INDEX "cultural_entries_status_content_type_id_idx" ON "cultural_entries"("status", "content_type_id");

-- CreateIndex
CREATE INDEX "cultural_entries_status_created_at_idx" ON "cultural_entries"("status", "created_at");

-- CreateIndex
CREATE INDEX "cultural_entries_author_id_status_idx" ON "cultural_entries"("author_id", "status");

-- CreateIndex
CREATE INDEX "content_versions_entry_id_idx" ON "content_versions"("entry_id");

-- CreateIndex
CREATE INDEX "content_versions_created_by_id_idx" ON "content_versions"("created_by_id");

-- CreateIndex
CREATE INDEX "content_versions_version_reason_idx" ON "content_versions"("version_reason");

-- CreateIndex
CREATE INDEX "content_versions_created_at_idx" ON "content_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_entry_id_version_number_key" ON "content_versions"("entry_id", "version_number");

-- CreateIndex
CREATE INDEX "moderation_reviews_entry_id_idx" ON "moderation_reviews"("entry_id");

-- CreateIndex
CREATE INDEX "moderation_reviews_moderator_id_idx" ON "moderation_reviews"("moderator_id");

-- CreateIndex
CREATE INDEX "moderation_reviews_decision_idx" ON "moderation_reviews"("decision");

-- CreateIndex
CREATE INDEX "moderation_reviews_created_at_idx" ON "moderation_reviews"("created_at");

-- CreateIndex
CREATE INDEX "moderation_reviews_decision_created_at_idx" ON "moderation_reviews"("decision", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_slug_key" ON "provinces"("slug");

-- CreateIndex
CREATE INDEX "provinces_is_active_idx" ON "provinces"("is_active");

-- CreateIndex
CREATE INDEX "provinces_sort_order_idx" ON "provinces"("sort_order");

-- CreateIndex
CREATE INDEX "districts_province_id_idx" ON "districts"("province_id");

-- CreateIndex
CREATE INDEX "districts_is_active_idx" ON "districts"("is_active");

-- CreateIndex
CREATE INDEX "districts_sort_order_idx" ON "districts"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "districts_province_id_name_key" ON "districts"("province_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "districts_province_id_slug_key" ON "districts"("province_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "content_types_name_key" ON "content_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "content_types_slug_key" ON "content_types"("slug");

-- CreateIndex
CREATE INDEX "content_types_is_active_idx" ON "content_types"("is_active");

-- CreateIndex
CREATE INDEX "content_types_sort_order_idx" ON "content_types"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_normalized_name_key" ON "tags"("normalized_name");

-- CreateIndex
CREATE INDEX "tags_is_active_idx" ON "tags"("is_active");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "entry_tags_tag_id_idx" ON "entry_tags"("tag_id");

-- CreateIndex
CREATE INDEX "entry_tags_entry_id_idx" ON "entry_tags"("entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_cloudinary_public_id_key" ON "images"("cloudinary_public_id");

-- CreateIndex
CREATE INDEX "images_entry_id_idx" ON "images"("entry_id");

-- CreateIndex
CREATE INDEX "images_uploaded_by_id_idx" ON "images"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "images_entry_id_display_order_idx" ON "images"("entry_id", "display_order");

-- CreateIndex
CREATE INDEX "images_is_removed_idx" ON "images"("is_removed");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_videos_entry_id_key" ON "youtube_videos"("entry_id");

-- CreateIndex
CREATE INDEX "youtube_videos_video_id_idx" ON "youtube_videos"("video_id");

-- CreateIndex
CREATE INDEX "youtube_videos_is_removed_idx" ON "youtube_videos"("is_removed");

-- CreateIndex
CREATE INDEX "sources_entry_id_idx" ON "sources"("entry_id");

-- CreateIndex
CREATE INDEX "sources_type_idx" ON "sources"("type");

-- CreateIndex
CREATE INDEX "sources_entry_id_display_order_idx" ON "sources"("entry_id", "display_order");

-- CreateIndex
CREATE INDEX "ratings_entry_id_idx" ON "ratings"("entry_id");

-- CreateIndex
CREATE INDEX "ratings_user_id_idx" ON "ratings"("user_id");

-- CreateIndex
CREATE INDEX "ratings_entry_id_is_active_idx" ON "ratings"("entry_id", "is_active");

-- CreateIndex
CREATE INDEX "ratings_value_idx" ON "ratings"("value");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_user_id_entry_id_key" ON "ratings"("user_id", "entry_id");

-- CreateIndex
CREATE INDEX "public_reviews_entry_id_idx" ON "public_reviews"("entry_id");

-- CreateIndex
CREATE INDEX "public_reviews_user_id_idx" ON "public_reviews"("user_id");

-- CreateIndex
CREATE INDEX "public_reviews_status_idx" ON "public_reviews"("status");

-- CreateIndex
CREATE INDEX "public_reviews_entry_id_status_idx" ON "public_reviews"("entry_id", "status");

-- CreateIndex
CREATE INDEX "public_reviews_user_id_status_idx" ON "public_reviews"("user_id", "status");

-- CreateIndex
CREATE INDEX "public_reviews_created_at_idx" ON "public_reviews"("created_at");

-- CreateIndex
-- Prisma schema cannot express partial unique indexes. This manual PostgreSQL
-- index enforces one ACTIVE public review per user and entry while allowing
-- another review after the previous one becomes DELETED or HIDDEN.
CREATE UNIQUE INDEX "public_reviews_one_active_per_user_entry_idx" ON "public_reviews"("user_id", "entry_id") WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "bookmarks_entry_id_idx" ON "bookmarks"("entry_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_created_at_idx" ON "bookmarks"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_entry_id_key" ON "bookmarks"("user_id", "entry_id");

-- CreateIndex
CREATE INDEX "correction_suggestions_entry_id_idx" ON "correction_suggestions"("entry_id");

-- CreateIndex
CREATE INDEX "correction_suggestions_submitted_by_id_idx" ON "correction_suggestions"("submitted_by_id");

-- CreateIndex
CREATE INDEX "correction_suggestions_reviewed_by_id_idx" ON "correction_suggestions"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "correction_suggestions_status_idx" ON "correction_suggestions"("status");

-- CreateIndex
CREATE INDEX "correction_suggestions_submitted_at_idx" ON "correction_suggestions"("submitted_at");

-- CreateIndex
CREATE INDEX "correction_suggestions_status_submitted_at_idx" ON "correction_suggestions"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "reports_entry_id_idx" ON "reports"("entry_id");

-- CreateIndex
CREATE INDEX "reports_reported_by_id_idx" ON "reports"("reported_by_id");

-- CreateIndex
CREATE INDEX "reports_reviewed_by_id_idx" ON "reports"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_reason_idx" ON "reports"("reason");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_sessions_token_hash_key" ON "refresh_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_sessions_user_id_idx" ON "refresh_sessions"("user_id");

-- CreateIndex
CREATE INDEX "refresh_sessions_expires_at_idx" ON "refresh_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_sessions_revoked_at_idx" ON "refresh_sessions"("revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "password_reset_tokens_used_at_idx" ON "password_reset_tokens"("used_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_user_id_idx" ON "audit_logs"("target_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entry_id_idx" ON "audit_logs"("entry_id");

-- CreateIndex
CREATE INDEX "audit_logs_report_id_idx" ON "audit_logs"("report_id");

-- CreateIndex
CREATE INDEX "audit_logs_correction_suggestion_id_idx" ON "audit_logs"("correction_suggestion_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_entries" ADD CONSTRAINT "cultural_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_entries" ADD CONSTRAINT "cultural_entries_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_entries" ADD CONSTRAINT "cultural_entries_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_entries" ADD CONSTRAINT "cultural_entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_entries" ADD CONSTRAINT "cultural_entries_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_correction_suggestion_id_fkey" FOREIGN KEY ("correction_suggestion_id") REFERENCES "correction_suggestions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_moderation_review_id_fkey" FOREIGN KEY ("moderation_review_id") REFERENCES "moderation_reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reviews" ADD CONSTRAINT "moderation_reviews_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reviews" ADD CONSTRAINT "moderation_reviews_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_tags" ADD CONSTRAINT "entry_tags_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_tags" ADD CONSTRAINT "entry_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_removed_by_id_fkey" FOREIGN KEY ("removed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtube_videos" ADD CONSTRAINT "youtube_videos_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtube_videos" ADD CONSTRAINT "youtube_videos_removed_by_id_fkey" FOREIGN KEY ("removed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_reviews" ADD CONSTRAINT "public_reviews_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_reviews" ADD CONSTRAINT "public_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_reviews" ADD CONSTRAINT "public_reviews_hidden_by_id_fkey" FOREIGN KEY ("hidden_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_suggestions" ADD CONSTRAINT "correction_suggestions_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_suggestions" ADD CONSTRAINT "correction_suggestions_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_suggestions" ADD CONSTRAINT "correction_suggestions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_suggestions" ADD CONSTRAINT "correction_suggestions_accepted_version_id_fkey" FOREIGN KEY ("accepted_version_id") REFERENCES "content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_replaced_by_id_fkey" FOREIGN KEY ("replaced_by_id") REFERENCES "refresh_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "cultural_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_correction_suggestion_id_fkey" FOREIGN KEY ("correction_suggestion_id") REFERENCES "correction_suggestions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
