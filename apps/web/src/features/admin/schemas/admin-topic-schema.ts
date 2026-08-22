import { z } from "zod";

const latinSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const adminTopicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام موضوع باید دست‌کم دو نویسه باشد.")
    .max(120, "نام موضوع بیش از حد طولانی است."),
  slug: z
    .string()
    .trim()
    .max(140, "نشانی موضوع بیش از حد طولانی است.")
    .refine(
      (value) => !value || latinSlugPattern.test(value),
      "نشانی فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.",
    ),
  description: z.string().trim().max(500, "توضیح موضوع نباید بیشتر از ۵۰۰ نویسه باشد."),
  sortOrder: z.coerce
    .number()
    .int("ترتیب باید عدد صحیح باشد.")
    .min(0, "ترتیب نمی‌تواند منفی باشد.")
    .max(1_000_000, "مقدار ترتیب معتبر نیست."),
  isActive: z.boolean(),
});

type AdminTopicFormValues = z.infer<typeof adminTopicSchema>;
type AdminTopicFormInput = z.input<typeof adminTopicSchema>;

export type { AdminTopicFormInput, AdminTopicFormValues };
export { adminTopicSchema, latinSlugPattern };
