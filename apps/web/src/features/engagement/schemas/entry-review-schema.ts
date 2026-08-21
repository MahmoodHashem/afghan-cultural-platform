import { z } from "zod";

const entryReviewSchema = z.object({
  body: z
    .string()
    .trim()
    .min(10, "دیدگاه باید حداقل ۱۰ حرف باشد.")
    .max(1200, "دیدگاه نباید بیشتر از ۱۲۰۰ حرف باشد."),
});

type EntryReviewFormValues = z.infer<typeof entryReviewSchema>;

export type { EntryReviewFormValues };
export { entryReviewSchema };
