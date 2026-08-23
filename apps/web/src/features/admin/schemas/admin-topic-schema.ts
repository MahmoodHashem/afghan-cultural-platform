import { z } from "zod";

const adminTopicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام موضوع باید دست‌کم دو حرف باشد.")
    .max(120, "نام موضوع بیش از حد طولانی است."),
  description: z.string().trim().max(500, "توضیح موضوع نباید بیشتر از ۵۰۰ حرف باشد."),
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
export { adminTopicSchema };
