import { z } from "zod";

const entryCommentSchema = z.object({
  body: z
    .string()
    .transform((value) => value.trim().replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(5, "دیدگاه باید دست‌کم ۵ حرف باشد.")
        .max(1000, "دیدگاه نباید بیشتر از ۱۰۰۰ حرف باشد."),
    ),
});

type EntryCommentFormValues = z.input<typeof entryCommentSchema>;

export type { EntryCommentFormValues };
export { entryCommentSchema };
