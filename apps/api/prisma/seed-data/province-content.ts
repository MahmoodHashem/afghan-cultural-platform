import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROVINCE_DESCRIPTION_MAX_LENGTH = 1_000;
const PROVINCE_HEADING_PATTERN = /^##\s+[۰-۹0-9]+\.\s+(.+?)\s*$/gm;

type ProvinceDescription = {
  description: string;
  name: string;
};

function normalizeProvinceDescription(markdown: string): string {
  const contentBeforeSource = markdown.split(/^\s*---\s*$/m, 1)[0] ?? "";

  return contentBeforeSource
    .replace(/^\s*\*+منبع:\*+.*$/gm, "")
    .replace(/\*+/g, "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function parseProvinceDescriptions(markdown: string): ProvinceDescription[] {
  const headings = [...markdown.matchAll(PROVINCE_HEADING_PATTERN)];

  return headings.map((heading, index) => {
    const name = heading[1]?.trim() ?? "";
    const sectionStart = (heading.index ?? 0) + heading[0].length;
    const sectionEnd = headings[index + 1]?.index ?? markdown.length;
    const description = normalizeProvinceDescription(markdown.slice(sectionStart, sectionEnd));

    if (!name || !description) {
      throw new Error(`Province content section ${index + 1} is incomplete.`);
    }

    if ([...description].length > PROVINCE_DESCRIPTION_MAX_LENGTH) {
      throw new Error(
        `Province description for "${name}" exceeds ${PROVINCE_DESCRIPTION_MAX_LENGTH} characters.`,
      );
    }

    return { description, name };
  });
}

function loadProvinceDescriptions(): ProvinceDescription[] {
  const contentPath = join(__dirname, "../content-library/provinces.md");
  return parseProvinceDescriptions(readFileSync(contentPath, "utf8"));
}

export type { ProvinceDescription };
export { loadProvinceDescriptions, PROVINCE_DESCRIPTION_MAX_LENGTH, parseProvinceDescriptions };
