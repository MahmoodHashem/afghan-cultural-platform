-- Rating has been removed from the product. Existing rating rows and
-- denormalized aggregates are intentionally discarded by this migration.
DROP TABLE "ratings";

ALTER TABLE "cultural_entries"
DROP COLUMN "average_rating",
DROP COLUMN "rating_count",
DROP COLUMN "last_rated_at";
