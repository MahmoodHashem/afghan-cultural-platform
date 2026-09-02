import {
  loadDistrictContent,
  parseDistrictContent,
} from "../../../prisma/seed-data/district-content";
import { provinces } from "../../../prisma/seed-data/taxonomy";

describe("district content library", () => {
  it("contains unique districts for all configured provinces", () => {
    const content = loadDistrictContent();
    const districts = content.flatMap((province) => province.districts);

    expect(content).toHaveLength(provinces.length);
    expect(new Set(content.map((province) => province.provinceName))).toEqual(
      new Set(provinces.map((province) => province.name)),
    );
    expect(districts).toHaveLength(416);

    for (const province of content) {
      expect(new Set(province.districts.map((district) => district.name)).size).toBe(
        province.districts.length,
      );
      expect(new Set(province.districts.map((district) => district.slug)).size).toBe(
        province.districts.length,
      );
      expect(province.districts.map((district) => district.sortOrder)).toEqual(
        province.districts.map((_, index) => index + 1),
      );
    }
  });

  it("maps the supplied Kandahar spelling to the canonical province name", () => {
    const content = parseDistrictContent("### ۱. کندهار\n\n* کندهار ([Wikipedia][1])");

    expect(content).toEqual([
      {
        provinceName: "قندهار",
        districts: [{ name: "کندهار", slug: "kndhar", sortOrder: 1 }],
      },
    ]);
  });

  it("rejects duplicate district names within one province", () => {
    expect(() => parseDistrictContent("### ۱. کابل\n\n* کابل\n* کابل")).toThrow(
      'Duplicate or empty district name found in "کابل": "کابل".',
    );
  });
});
