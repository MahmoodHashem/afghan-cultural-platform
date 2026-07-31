type SeedTaxonomyItem = {
  name: string;
  slug: string;
  sortOrder: number;
};

export const provinces: SeedTaxonomyItem[] = [
  { name: "بدخشان", slug: "badakhshan", sortOrder: 1 },
  { name: "بادغیس", slug: "badghis", sortOrder: 2 },
  { name: "بغلان", slug: "baghlan", sortOrder: 3 },
  { name: "بلخ", slug: "balkh", sortOrder: 4 },
  { name: "بامیان", slug: "bamyan", sortOrder: 5 },
  { name: "دایکندی", slug: "daykundi", sortOrder: 6 },
  { name: "فراه", slug: "farah", sortOrder: 7 },
  { name: "فاریاب", slug: "faryab", sortOrder: 8 },
  { name: "غزنی", slug: "ghazni", sortOrder: 9 },
  { name: "غور", slug: "ghor", sortOrder: 10 },
  { name: "هلمند", slug: "helmand", sortOrder: 11 },
  { name: "هرات", slug: "herat", sortOrder: 12 },
  { name: "جوزجان", slug: "jowzjan", sortOrder: 13 },
  { name: "کابل", slug: "kabul", sortOrder: 14 },
  { name: "قندهار", slug: "kandahar", sortOrder: 15 },
  { name: "کاپیسا", slug: "kapisa", sortOrder: 16 },
  { name: "خوست", slug: "khost", sortOrder: 17 },
  { name: "کنر", slug: "kunar", sortOrder: 18 },
  { name: "کندز", slug: "kunduz", sortOrder: 19 },
  { name: "لغمان", slug: "laghman", sortOrder: 20 },
  { name: "لوگر", slug: "logar", sortOrder: 21 },
  { name: "ننگرهار", slug: "nangarhar", sortOrder: 22 },
  { name: "نیمروز", slug: "nimroz", sortOrder: 23 },
  { name: "نورستان", slug: "nuristan", sortOrder: 24 },
  { name: "پکتیا", slug: "paktia", sortOrder: 25 },
  { name: "پکتیکا", slug: "paktika", sortOrder: 26 },
  { name: "پنجشیر", slug: "panjshir", sortOrder: 27 },
  { name: "پروان", slug: "parwan", sortOrder: 28 },
  { name: "سمنگان", slug: "samangan", sortOrder: 29 },
  { name: "سرپل", slug: "sar-e-pol", sortOrder: 30 },
  { name: "تخار", slug: "takhar", sortOrder: 31 },
  { name: "ارزگان", slug: "uruzgan", sortOrder: 32 },
  { name: "میدان وردک", slug: "wardak", sortOrder: 33 },
  { name: "زابل", slug: "zabul", sortOrder: 34 },
];

export const categories: SeedTaxonomyItem[] = [
  { name: "رسم‌ها و عنعنات", slug: "traditions-and-customs", sortOrder: 1 },
  { name: "جای‌های تاریخی", slug: "historical-places", sortOrder: 2 },
  { name: "غذا", slug: "food", sortOrder: 3 },
  { name: "لباس", slug: "clothing", sortOrder: 4 },
  { name: "صنایع دستی", slug: "handicrafts", sortOrder: 5 },
  { name: "موسیقی", slug: "music", sortOrder: 6 },
  { name: "شعر و ادبیات", slug: "poetry-and-literature", sortOrder: 7 },
  { name: "قصه‌های شفاهی", slug: "oral-stories", sortOrder: 8 },
  { name: "جشن‌ها و مراسم", slug: "festivals-and-ceremonies", sortOrder: 9 },
  { name: "زبان‌ها و اصطلاحات", slug: "languages-and-expressions", sortOrder: 10 },
  { name: "معماری", slug: "architecture", sortOrder: 11 },
  { name: "اشیای فرهنگی", slug: "cultural-objects", sortOrder: 12 },
  { name: "بازی‌های محلی", slug: "local-games", sortOrder: 13 },
  { name: "پیشه‌های سنتی", slug: "traditional-occupations", sortOrder: 14 },
];

export const contentTypes: SeedTaxonomyItem[] = [
  { name: "مقاله فرهنگی", slug: "cultural-article", sortOrder: 1 },
  { name: "قصه فرهنگی یا تاریخ شفاهی", slug: "cultural-story-or-oral-history", sortOrder: 2 },
  { name: "رسم یا عنعنه", slug: "tradition-or-custom", sortOrder: 3 },
  { name: "جای فرهنگی یا تاریخی", slug: "cultural-or-historical-place", sortOrder: 4 },
  { name: "عمل فرهنگی", slug: "cultural-practice", sortOrder: 5 },
];
