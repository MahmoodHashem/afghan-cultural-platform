-- Add stable internal Cultural Entry keys while switching public entry slugs to Persian URL text.
-- Relationships continue to use UUID IDs; key is for seed/import/tooling identity only.
ALTER TABLE "cultural_entries" ADD COLUMN "key" TEXT;

UPDATE "cultural_entries"
SET
  "key" = CASE "slug"
    WHEN 'abdul-rahman-jami' THEN 'abdul-rahman-jami'
    WHEN 'afghan-handicrafts' THEN 'afghan-handicrafts'
    WHEN 'ahmad-shah-durrani' THEN 'ahmad-shah-durrani'
    WHEN 'babur-garden' THEN 'babur-garden'
    WHEN 'dozandagi' THEN 'dozandagi'
    WHEN 'fakhr-razi' THEN 'fakhr-razi'
    WHEN 'gand-afghan-dress' THEN 'gand-afghan-dress'
    WHEN 'herat-citadel' THEN 'herat-citadel'
    WHEN 'jami-mosque-herat' THEN 'jami-mosque-herat'
    WHEN 'kabuli-pulao' THEN 'kabuli-pulao'
    WHEN 'khwaja-abdullah-ansari' THEN 'khwaja-abdullah-ansari'
    WHEN 'molana-jalaluddin-balkhi' THEN 'molana-jalaluddin-balkhi'
    WHEN 'qala-bost' THEN 'qala-bost'
    WHEN 'qalin' THEN 'qalin'
    WHEN 'timur-shah-mausoleum' THEN 'timur-shah-mausoleum'
    ELSE "key"
  END,
  "slug" = CASE "slug"
    WHEN 'abdul-rahman-jami' THEN 'عبدالرحمن-جامی'
    WHEN 'afghan-handicrafts' THEN 'صنایع-دستی-افغانستان'
    WHEN 'ahmad-shah-durrani' THEN 'احمدشاه-درانی'
    WHEN 'babur-garden' THEN 'باغ-بابر'
    WHEN 'dozandagi' THEN 'دوزندگی-سنتی-در-افغانستان'
    WHEN 'fakhr-razi' THEN 'فخر-رازی'
    WHEN 'gand-afghan-dress' THEN 'لباس-محلی-گند-افغانی'
    WHEN 'herat-citadel' THEN 'ارگ-هرات'
    WHEN 'jami-mosque-herat' THEN 'مسجد-جامع-هرات'
    WHEN 'kabuli-pulao' THEN 'کابلی-پلو'
    WHEN 'khwaja-abdullah-ansari' THEN 'خواجه-عبدالله-انصاری'
    WHEN 'molana-jalaluddin-balkhi' THEN 'مولانا-جلال-الدین-بلخی'
    WHEN 'qala-bost' THEN 'قلعه-بست'
    WHEN 'qalin' THEN 'قالین-بافی-در-افغانستان'
    WHEN 'timur-shah-mausoleum' THEN 'آرامگاه-تیمورشاه'
    ELSE "slug"
  END
WHERE "slug" IN (
  'abdul-rahman-jami',
  'afghan-handicrafts',
  'ahmad-shah-durrani',
  'babur-garden',
  'dozandagi',
  'fakhr-razi',
  'gand-afghan-dress',
  'herat-citadel',
  'jami-mosque-herat',
  'kabuli-pulao',
  'khwaja-abdullah-ansari',
  'molana-jalaluddin-balkhi',
  'qala-bost',
  'qalin',
  'timur-shah-mausoleum'
);

DO $$
DECLARE
  unmapped_entries TEXT;
BEGIN
  SELECT string_agg("id"::TEXT || ':' || COALESCE("slug", '<null>'), ', ')
  INTO unmapped_entries
  FROM "cultural_entries"
  WHERE "key" IS NULL;

  IF unmapped_entries IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot backfill CulturalEntry.key for unmapped entries: %', unmapped_entries;
  END IF;

  IF EXISTS (SELECT 1 FROM "cultural_entries" WHERE "slug" IS NULL) THEN
    RAISE EXCEPTION 'Cannot make CulturalEntry.slug required while null slugs exist.';
  END IF;
END $$;

ALTER TABLE "cultural_entries" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "cultural_entries" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "cultural_entries_key_key" ON "cultural_entries"("key");
