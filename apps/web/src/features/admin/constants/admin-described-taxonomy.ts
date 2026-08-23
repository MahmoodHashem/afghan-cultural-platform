type AdminDescribedTaxonomyKind = "topics" | "contentTypes";

type AdminDescribedTaxonomyConfig = {
  kind: AdminDescribedTaxonomyKind;
  endpoint: "categories" | "content-types";
  route: "/admin/topics" | "/admin/content-types";
  title: string;
  singular: string;
  plural: string;
  description: string;
  formDescription: string;
  namePlaceholder: string;
  entryFilter: "categoryId" | "contentTypeId";
};

const describedTaxonomyConfigs: Record<AdminDescribedTaxonomyKind, AdminDescribedTaxonomyConfig> = {
  topics: {
    kind: "topics",
    endpoint: "categories",
    route: "/admin/topics",
    title: "موضوع‌ها",
    singular: "موضوع",
    plural: "موضوع‌ها",
    description: "ساخت و ویرایش موضوع‌های اصلی برای دسته‌بندی مطالب فرهنگی",
    formDescription: "موضوع‌ها در سایت برای دسته‌بندی مطالب فرهنگی استفاده می‌شوند.",
    namePlaceholder: "برای نمونه: مکان‌های تاریخی",
    entryFilter: "categoryId",
  },
  contentTypes: {
    kind: "contentTypes",
    endpoint: "content-types",
    route: "/admin/content-types",
    title: "نوع مطلب",
    singular: "نوع مطلب",
    plural: "انواع مطلب",
    description: "مدیریت قالب‌ها و گونه‌هایی که مطالب فرهنگی با آن‌ها منتشر می‌شوند",
    formDescription: "نوع مطلب شکل و قالب محتوای منتشرشده را مشخص می‌کند.",
    namePlaceholder: "برای نمونه: مقاله فرهنگی",
    entryFilter: "contentTypeId",
  },
};

export type { AdminDescribedTaxonomyConfig, AdminDescribedTaxonomyKind };
export { describedTaxonomyConfigs };
