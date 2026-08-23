ALTER TABLE "provinces"
ADD COLUMN "description" TEXT,
ADD COLUMN "image_cloudinary_public_id" TEXT,
ADD COLUMN "image_secure_url" TEXT,
ADD COLUMN "image_thumbnail_url" TEXT,
ADD COLUMN "image_alt_text" TEXT,
ADD COLUMN "image_width" INTEGER,
ADD COLUMN "image_height" INTEGER;

CREATE UNIQUE INDEX "provinces_image_cloudinary_public_id_key"
ON "provinces"("image_cloudinary_public_id");

ALTER TABLE "provinces"
ADD CONSTRAINT "provinces_image_metadata_consistent_check"
CHECK (
  (
    "image_cloudinary_public_id" IS NULL
    AND "image_secure_url" IS NULL
    AND "image_thumbnail_url" IS NULL
    AND "image_alt_text" IS NULL
    AND "image_width" IS NULL
    AND "image_height" IS NULL
  )
  OR (
    "image_cloudinary_public_id" IS NOT NULL
    AND "image_secure_url" IS NOT NULL
    AND "image_thumbnail_url" IS NOT NULL
    AND "image_alt_text" IS NOT NULL
  )
);
