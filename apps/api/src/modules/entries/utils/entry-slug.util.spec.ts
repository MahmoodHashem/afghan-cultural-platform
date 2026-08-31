import {
  createEntryKeyFromId,
  createEntrySlug,
  createLatinKebabSlug,
  createUniqueEntrySlug,
  isValidEntryKey,
  isValidEntrySlug,
  normalizeEntrySlug,
} from "./entry-slug.util";

describe("entry slug utilities", () => {
  it("creates a Persian public slug from a Persian title", () => {
    expect(createEntrySlug("فرهنگ کابل")).toBe("فرهنگ-کابل");
    expect(createEntrySlug("ارگ هرات")).toBe("ارگ-هرات");
    expect(createEntrySlug("خواجه عبدالله انصاری")).toBe("خواجه-عبدالله-انصاری");
  });

  it("adds a deterministic suffix when a slug already exists", async () => {
    const existingSlugs = new Set(["فرهنگ-کابل", "فرهنگ-کابل-2"]);

    await expect(
      createUniqueEntrySlug("فرهنگ کابل", async (slug) => existingSlugs.has(slug)),
    ).resolves.toBe("فرهنگ-کابل-3");
  });

  it("normalizes Arabic/Persian characters and punctuation for public slugs", () => {
    expect(normalizeEntrySlug("كابلی‌پلو")).toBe("کابلی-پلو");
    expect(normalizeEntrySlug("مولانا جلال‌الدین بلخی!")).toBe("مولانا-جلال-الدین-بلخی");
  });

  it("validates stable internal keys", () => {
    expect(isValidEntryKey("khwaja-abdullah-ansari")).toBe(true);
    expect(isValidEntryKey("Khwaja-Abdullah")).toBe(false);
    expect(isValidEntryKey("khwaja--abdullah")).toBe(false);
    expect(isValidEntryKey("-khwaja")).toBe(false);
    expect(createEntryKeyFromId("22222222-2222-4222-8222-222222222222")).toBe(
      "entry-22222222-2222-4222-8222-222222222222",
    );
  });

  it("validates normalized Persian public slugs", () => {
    expect(isValidEntrySlug("مسجد-جامع-هرات")).toBe(true);
    expect(isValidEntrySlug("مسجد جامع هرات")).toBe(false);
    expect(isValidEntrySlug("مسجد--جامع")).toBe(false);
  });

  it("keeps Latin kebab generation available for taxonomy slugs", () => {
    expect(createLatinKebabSlug("فرهنگ کابل")).toBe("frhng-kabl");
  });
});
