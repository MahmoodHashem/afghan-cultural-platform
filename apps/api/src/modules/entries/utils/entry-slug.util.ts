const PERSIAN_TRANSLITERATION: Record<string, string> = {
  آ: "a",
  ا: "a",
  أ: "a",
  إ: "a",
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
  ك: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "w",
  ه: "h",
  ی: "y",
  ي: "y",
  ى: "y",
  ء: "",
};

function createEntrySlug(input: string, fallback = "entry"): string {
  const transliterated = [...input.trim()]
    .map((character) => PERSIAN_TRANSLITERATION[character] ?? character)
    .join("");
  const slug = transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

async function createUniqueEntrySlug(
  title: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = createEntrySlug(title);
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugExists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function normalizeEntrySearchText(parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export { createEntrySlug, createUniqueEntrySlug, normalizeEntrySearchText };
