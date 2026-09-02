import {
  loadProvinceDescriptions,
  PROVINCE_DESCRIPTION_MAX_LENGTH,
  parseProvinceDescriptions,
} from "../../../prisma/seed-data/province-content";
import { provinces } from "../../../prisma/seed-data/taxonomy";

describe("province content library", () => {
  it("contains one valid description for every configured province", () => {
    const descriptions = loadProvinceDescriptions();

    expect(descriptions).toHaveLength(provinces.length);
    expect(new Set(descriptions.map((item) => item.name)).size).toBe(provinces.length);
    expect(descriptions.map((item) => item.name)).toEqual(provinces.map((item) => item.name));

    for (const item of descriptions) {
      expect(item.description).not.toContain("Wikipedia");
      expect(item.description).not.toContain("****");
      expect([...item.description].length).toBeLessThanOrEqual(PROVINCE_DESCRIPTION_MAX_LENGTH);
    }
  });

  it("rejects descriptions above the supported limit", () => {
    const oversizedDescription = "الف".repeat(PROVINCE_DESCRIPTION_MAX_LENGTH + 1);

    expect(() => parseProvinceDescriptions(`## ۱. کابل\n\n${oversizedDescription}`)).toThrow(
      `Province description for "کابل" exceeds ${PROVINCE_DESCRIPTION_MAX_LENGTH} characters.`,
    );
  });
});
