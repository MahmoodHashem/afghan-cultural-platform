import { SLUG_PATTERN } from "./dto/taxonomy-management.dto";

const PERSIAN_TRANSLITERATION: Record<string, string> = {
  آ: "a",
  ا: "a",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ک: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "w",
  ه: "h",
  ی: "y",
  ء: "",
};

function normalizeTaxonomyName(name: string): string {
  return name.trim().replaceAll("ي", "ی").replaceAll("ك", "ک").replace(/\s+/g, " ").toLowerCase();
}

function createSlug(input: string, fallback = "item"): string {
  const transliterated = [...input.trim()]
    .map((character) => PERSIAN_TRANSLITERATION[character] ?? character)
    .join("");
  const slug = transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return slug && SLUG_PATTERN.test(slug) ? slug : fallback;
}

function resolveSlug(name: string, slug?: string): string {
  return slug ? slug.trim() : createSlug(name);
}

export { createSlug, normalizeTaxonomyName, resolveSlug };
