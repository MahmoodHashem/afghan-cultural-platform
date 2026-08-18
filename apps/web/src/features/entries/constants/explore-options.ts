import type { GeographicScope, PublicEntrySort } from "../api/public-entries-api";

const sortOptions: Array<{ label: string; value: PublicEntrySort }> = [
  { label: "تازه‌ترین", value: "newest" },
  { label: "قدیمی‌ترین", value: "oldest" },
  { label: "آخرین ویرایش", value: "recentlyUpdated" },
];

const geographicScopeOptions: Array<{ label: string; value: GeographicScope }> = [
  { label: "وابسته به یک ولایت", value: "PROVINCE" },
  { label: "سراسر افغانستان", value: "NATIONAL" },
  { label: "بدون وابستگی به مکان", value: "NONE" },
];

export { geographicScopeOptions, sortOptions };
