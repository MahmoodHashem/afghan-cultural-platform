import { z } from "zod";

const passwordMessage =
  "رمز عبور باید بین ۱۰ تا ۱۲۸ کاراکتر باشد و دست‌کم یک حرف کوچک انگلیسی، یک حرف بزرگ انگلیسی و یک عدد داشته باشد.";

const passwordSchema = z
  .string()
  .min(10, passwordMessage)
  .max(128, passwordMessage)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, passwordMessage);

const loginSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر وارد کنید."),
  password: z.string().min(1, "رمز عبور را وارد کنید."),
  rememberMe: z.boolean(),
});

const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "نام و نام خانوادگی باید حداقل ۲ حرف باشد.")
      .max(80, "نام و نام خانوادگی نمی‌تواند بیشتر از ۸۰ حرف باشد."),
    email: z.string().trim().email("ایمیل معتبر وارد کنید."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تکرار رمز عبور را وارد کنید."),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "برای ثبت‌نام باید شرایط استفاده و سیاست حفظ حریم خصوصی را بپذیرید.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "رمز عبور و تکرار آن یکسان نیستند.",
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export type { LoginFormValues, RegisterFormValues };
export { loginSchema, passwordMessage, registerSchema };
