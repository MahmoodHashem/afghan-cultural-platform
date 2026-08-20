import { z } from "zod";

import type { RichTextContent } from "@/components/common/rich-text-editor";
import type { GeographicScope, SourceType } from "@/features/entries/api/entry-drafts-api";
import { hasTiptapPlainText, isTiptapDocument } from "@/features/entries/utils/tiptap-content";

const GEOGRAPHIC_SCOPE_VALUES = ["PROVINCE", "NATIONAL", "NONE"] as const;
const SOURCE_TYPE_VALUES = [
  "BOOK",
  "ACADEMIC_ARTICLE",
  "WEBSITE",
  "ARCHIVE",
  "INTERVIEW",
  "ORAL_SOURCE",
  "PERSONAL_EXPERIENCE",
  "MUSEUM_OR_INSTITUTION",
  "OTHER",
] as const;

const sourceSchema = z.object({
  id: z.string().optional(),
  type: z.enum(SOURCE_TYPE_VALUES),
  title: z.string().max(220, "عنوان منبع کوتاه‌تر باشد.").optional(),
  authorOrProvider: z.string().max(180, "نام نویسنده یا نهاد کوتاه‌تر باشد.").optional(),
  publicationDate: z.string().max(120, "تاریخ نشر کوتاه‌تر باشد.").optional(),
  websiteUrl: z
    .string()
    .max(500, "نشانی اینترنتی کوتاه‌تر باشد.")
    .optional()
    .refine((value) => !value || /^https?:\/\/\S+/i.test(value), {
      message: "نشانی اینترنتی معتبر وارد کنید.",
    }),
  bookOrArticleDetails: z.string().max(1000, "جزئیات منبع کوتاه‌تر باشد.").optional(),
  interviewDate: z.string().optional(),
  explanation: z.string().max(1000, "توضیح منبع کوتاه‌تر باشد.").optional(),
});

const createEntryFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "عنوان باید دست‌کم ۲ حرف باشد.")
      .max(180, "عنوان باید کوتاه‌تر باشد."),
    summary: z
      .string()
      .trim()
      .min(10, "خلاصه باید کمی کامل‌تر باشد.")
      .max(700, "خلاصه باید کوتاه‌تر باشد."),
    contentJson: z
      .custom<RichTextContent>((value) => isTiptapDocument(value), "متن مطلب معتبر نیست.")
      .refine((value) => hasTiptapPlainText(value), {
        message: "متن مطلب را بنویسید.",
      }),
    geographicScope: z.enum(GEOGRAPHIC_SCOPE_VALUES),
    provinceId: z.string().optional(),
    districtId: z.string().optional(),
    categoryId: z.string().min(1, "موضوع را انتخاب کنید."),
    contentTypeId: z.string().min(1, "نوع مطلب را انتخاب کنید."),
    villageOrLocation: z.string().max(220, "نام محل کوتاه‌تر باشد.").optional(),
    tagIds: z.array(z.string()).max(50, "تعداد برچسب‌ها زیاد است."),
    sources: z.array(sourceSchema).max(20, "تعداد منابع زیاد است."),
    youtubeUrl: z
      .string()
      .max(500, "نشانی ویدیو کوتاه‌تر باشد.")
      .optional()
      .refine(
        (value) =>
          !value ||
          /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(value) ||
          /^https:\/\/youtu\.be\//.test(value) ||
          /^https:\/\/(www\.)?youtube\.com\/shorts\//.test(value),
        "نشانی یوتیوب معتبر وارد کنید.",
      ),
    youtubeTitle: z.string().max(220, "عنوان ویدیو کوتاه‌تر باشد.").optional(),
    youtubeDescription: z.string().max(1000, "توضیح ویدیو کوتاه‌تر باشد.").optional(),
  })
  .superRefine((value, context) => {
    if (value.geographicScope === "PROVINCE" && !value.provinceId) {
      context.addIssue({
        code: "custom",
        path: ["provinceId"],
        message: "برای مطلب وابسته به یک ولایت، ولایت را انتخاب کنید.",
      });
    }

    if (value.geographicScope !== "PROVINCE" && value.provinceId) {
      context.addIssue({
        code: "custom",
        path: ["provinceId"],
        message: "برای این محدوده جغرافیایی، ولایت نباید انتخاب شود.",
      });
    }

    if (value.geographicScope !== "PROVINCE" && value.districtId) {
      context.addIssue({
        code: "custom",
        path: ["districtId"],
        message: "برای این محدوده جغرافیایی، ولسوالی نباید انتخاب شود.",
      });
    }
  });

type CreateEntryFormValues = z.infer<typeof createEntryFormSchema>;

const geographicScopeLabels: Record<GeographicScope, string> = {
  PROVINCE: "وابسته به یک ولایت",
  NATIONAL: "سراسر افغانستان",
  NONE: "بدون وابستگی به مکان",
};

const sourceTypeLabels: Record<SourceType, string> = {
  BOOK: "کتاب",
  ACADEMIC_ARTICLE: "مقاله علمی",
  WEBSITE: "وب‌سایت",
  ARCHIVE: "آرشیو",
  INTERVIEW: "مصاحبه",
  ORAL_SOURCE: "منبع شفاهی",
  PERSONAL_EXPERIENCE: "تجربه شخصی",
  MUSEUM_OR_INSTITUTION: "موزه یا نهاد",
  OTHER: "دیگر",
};

export type { CreateEntryFormValues };
export {
  createEntryFormSchema,
  GEOGRAPHIC_SCOPE_VALUES,
  geographicScopeLabels,
  SOURCE_TYPE_VALUES,
  sourceTypeLabels,
};
