import { z } from "zod";

const adminReportResolutionSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(3, "دلیل تصمیم باید دست‌کم ۳ حرف باشد.")
    .max(1200, "دلیل تصمیم نمی‌تواند بیشتر از ۱۲۰۰ حرف باشد."),
});

type AdminReportResolutionValues = z.infer<typeof adminReportResolutionSchema>;

export type { AdminReportResolutionValues };
export { adminReportResolutionSchema };
