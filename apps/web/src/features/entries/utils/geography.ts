type EntryGeography = {
  geographicScope: "PROVINCE" | "NATIONAL" | "NONE";
  province?: { name: string } | null;
};

function getEntryLocationLabel(entry: EntryGeography) {
  if (entry.geographicScope === "NATIONAL") {
    return "سراسر افغانستان";
  }

  if (entry.geographicScope === "NONE") {
    return "بدون وابستگی به مکان";
  }

  return entry.province?.name ?? "وابسته به یک ولایت";
}

export type { EntryGeography };
export { getEntryLocationLabel };
