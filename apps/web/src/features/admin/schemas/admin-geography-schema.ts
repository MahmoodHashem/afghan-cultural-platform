import { z } from "zod";

const sortOrderSchema = z.coerce
  .number()
  .int("ترتیب باید عدد صحیح باشد.")
  .min(0, "ترتیب نمی‌تواند منفی باشد.")
  .max(1_000_000, "مقدار ترتیب معتبر نیست.");

const adminProvinceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام ولایت باید دست‌کم دو حرف باشد.")
    .max(120, "نام ولایت بیش از حد طولانی است."),
  description: z.string().trim().max(1500, "توضیح ولایت نباید بیشتر از ۱۵۰۰ حرف باشد."),
  sortOrder: sortOrderSchema,
  isActive: z.boolean(),
});

const adminDistrictSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام ولسوالی باید دست‌کم دو حرف باشد.")
    .max(120, "نام ولسوالی بیش از حد طولانی است."),
  sortOrder: sortOrderSchema,
  isActive: z.boolean(),
});

const adminProvinceImageSchema = z.object({
  altText: z
    .string()
    .trim()
    .min(2, "متن جایگزین تصویر را بنویسید.")
    .max(220, "متن جایگزین نباید بیشتر از ۲۲۰ حرف باشد."),
});

type AdminProvinceFormInput = z.input<typeof adminProvinceSchema>;
type AdminProvinceFormValues = z.infer<typeof adminProvinceSchema>;
type AdminDistrictFormInput = z.input<typeof adminDistrictSchema>;
type AdminDistrictFormValues = z.infer<typeof adminDistrictSchema>;
type AdminProvinceImageValues = z.infer<typeof adminProvinceImageSchema>;

export type {
  AdminDistrictFormInput,
  AdminDistrictFormValues,
  AdminProvinceFormInput,
  AdminProvinceFormValues,
  AdminProvinceImageValues,
};
export { adminDistrictSchema, adminProvinceImageSchema, adminProvinceSchema };
