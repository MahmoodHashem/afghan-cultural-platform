import { z } from "zod";

const adminUserRoleReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "دلیل تغییر نقش باید دست‌کم سه حرف باشد.")
    .max(600, "دلیل تغییر نقش بیش از حد طولانی است."),
});

type AdminUserRoleReasonValues = z.infer<typeof adminUserRoleReasonSchema>;

export type { AdminUserRoleReasonValues };
export { adminUserRoleReasonSchema };
