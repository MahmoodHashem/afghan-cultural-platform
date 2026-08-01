import { createEntrySlug, createUniqueEntrySlug } from "@/modules/entries/utils/entry-slug.util";

describe("entry slug utilities", () => {
  it("creates a stable Latin slug from a Persian title", () => {
    expect(createEntrySlug("فرهنگ کابل")).toBe("frhng-kabl");
  });

  it("adds a deterministic suffix when a slug already exists", async () => {
    const existingSlugs = new Set(["frhng-kabl", "frhng-kabl-2"]);

    await expect(
      createUniqueEntrySlug("فرهنگ کابل", async (slug) => existingSlugs.has(slug)),
    ).resolves.toBe("frhng-kabl-3");
  });
});
