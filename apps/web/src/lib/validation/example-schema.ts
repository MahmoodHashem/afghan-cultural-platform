import { z } from "zod";

const exampleFormSchema = z.object({
  name: z.string().min(2, "نام باید حداقل دو حرف باشد."),
  email: z.email("ایمیل معتبر وارد کنید."),
});

type ExampleFormValues = z.infer<typeof exampleFormSchema>;

export type { ExampleFormValues };
export { exampleFormSchema };
