type EntryShareData = {
  title: string;
  summary: string;
  url: string;
};

type EntryShareDestination = {
  key: "whatsapp" | "telegram" | "facebook" | "x" | "email";
  label: string;
  href: string;
};

const MAX_SHARE_SUMMARY_LENGTH = 180;

function createCanonicalEntryUrl(origin: string, pathname: string) {
  const safeOrigin = origin.replace(/\/$/, "");
  const safePathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${safeOrigin}${safePathname}`;
}

function createEntryShareDestinations({
  title,
  summary,
  url,
}: EntryShareData): EntryShareDestination[] {
  const normalizedSummary = normalizeShareText(summary).slice(0, MAX_SHARE_SUMMARY_LENGTH);
  const message = [normalizeShareText(title), normalizedSummary, url].filter(Boolean).join("\n");

  return [
    {
      key: "whatsapp",
      label: "واتس‌اپ",
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
    },
    {
      key: "telegram",
      label: "تلگرام",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        [title, normalizedSummary].filter(Boolean).join("\n"),
      )}`,
    },
    {
      key: "facebook",
      label: "فیسبوک",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}&quote=${encodeURIComponent([title, normalizedSummary].filter(Boolean).join(" — "))}`,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        [title, normalizedSummary].filter(Boolean).join(" — "),
      )}&url=${encodeURIComponent(url)}`,
    },
    {
      key: "email",
      label: "ایمیل",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`,
    },
  ];
}

function normalizeShareText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export type { EntryShareData, EntryShareDestination };
export { createCanonicalEntryUrl, createEntryShareDestinations };
