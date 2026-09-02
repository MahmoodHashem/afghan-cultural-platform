import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createSlug } from "../../src/modules/taxonomy/taxonomy.utils";

const DISTRICT_HEADING_PATTERN = /^###\s+[۰-۹0-9]+\.\s+(.+?)\s*$/gm;
const DISTRICT_ITEM_PATTERN = /^\s*\*\s+(.+?)\s*$/gm;
const PROVINCE_NAME_ALIASES = new Map([["کندهار", "قندهار"]]);

type DistrictContentItem = {
  name: string;
  slug: string;
  sortOrder: number;
};

type ProvinceDistrictContent = {
  districts: DistrictContentItem[];
  provinceName: string;
};

function normalizeDistrictName(markdownItem: string): string {
  return markdownItem
    .replace(/\s*\(\[Wikipedia\]\[\d+\]\)\s*$/, "")
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDistrictContent(markdown: string): ProvinceDistrictContent[] {
  const headings = [...markdown.matchAll(DISTRICT_HEADING_PATTERN)];

  return headings.map((heading, provinceIndex) => {
    const sourceProvinceName = heading[1]?.trim() ?? "";
    const provinceName = PROVINCE_NAME_ALIASES.get(sourceProvinceName) ?? sourceProvinceName;
    const sectionStart = (heading.index ?? 0) + heading[0].length;
    const sectionEnd = headings[provinceIndex + 1]?.index ?? markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);
    const districtNames = [...section.matchAll(DISTRICT_ITEM_PATTERN)].map((match) =>
      normalizeDistrictName(match[1] ?? ""),
    );

    if (!provinceName || districtNames.length === 0) {
      throw new Error(`District content section ${provinceIndex + 1} is incomplete.`);
    }

    const names = new Set<string>();
    const slugs = new Set<string>();
    const districts = districtNames.map((name, districtIndex) => {
      const slug = createSlug(name);

      if (!name || names.has(name)) {
        throw new Error(`Duplicate or empty district name found in "${provinceName}": "${name}".`);
      }

      if (slugs.has(slug)) {
        throw new Error(`Duplicate district slug found in "${provinceName}": "${slug}".`);
      }

      names.add(name);
      slugs.add(slug);

      return {
        name,
        slug,
        sortOrder: districtIndex + 1,
      };
    });

    return { districts, provinceName };
  });
}

function loadDistrictContent(): ProvinceDistrictContent[] {
  const contentPath = join(__dirname, "../content-library/districts.md");
  return parseDistrictContent(readFileSync(contentPath, "utf8"));
}

export type { DistrictContentItem, ProvinceDistrictContent };
export { loadDistrictContent, parseDistrictContent };
