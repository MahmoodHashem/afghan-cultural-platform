import { z } from "zod";

const adminTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام برچسب باید دست‌کم دو حرف باشد.")
    .max(120, "نام برچسب بیش از حد طولانی است."),
  isActive: z.boolean(),
});

type AdminTagFormValues = z.infer<typeof adminTagSchema>;

export type { AdminTagFormValues };
export { adminTagSchema };
