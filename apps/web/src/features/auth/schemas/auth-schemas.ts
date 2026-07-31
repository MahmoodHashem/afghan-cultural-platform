import { z } from "zod";

const passwordMessage =
  "رمز عبور باید ۱۰ تا ۱۲۸ نویسه باشد و حداقل یک حرف کوچک، یک حرف بزرگ و یک عدد داشته باشد.";

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
      .min(2, "نام و نام خانوادگی باید حداقل ۲ نویسه باشد.")
      .max(80, "نام و نام خانوادگی نمی‌تواند بیشتر از ۸۰ نویسه باشد."),
    email: z.string().trim().email("ایمیل معتبر وارد کنید."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تکرار رمز عبور را وارد کنید."),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "پذیرش شرایط استفاده و سیاست حریم خصوصی الزامی است.",
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
