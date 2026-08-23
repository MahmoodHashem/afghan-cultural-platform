import { z } from "zod";

const moderationReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "دلیل تصمیم را بنویسید.")
    .max(1200, "دلیل تصمیم نباید بیشتر از ۱۲۰۰ حرف باشد."),
});

type ModerationReasonValues = z.infer<typeof moderationReasonSchema>;

export type { ModerationReasonValues };
export { moderationReasonSchema };
