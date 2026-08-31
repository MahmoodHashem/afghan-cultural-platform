import { z } from "zod";

const profileIdentitySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "نام باید دست‌کم ۲ حرف باشد.")
    .max(80, "نام نباید بیشتر از ۸۰ حرف باشد."),
});

type ProfileIdentityValues = z.infer<typeof profileIdentitySchema>;

export type { ProfileIdentityValues };
export { profileIdentitySchema };
