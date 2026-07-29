"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ExampleFormValues, exampleFormSchema } from "@/lib/validation/example-schema";

function ExampleFormPreview() {
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(values: ExampleFormValues) {
    toast.success("فرم نمونه با موفقیت بررسی شد.", {
      description: `${values.name}، هیچ درخواستی به سرور ارسال نشد.`,
    });
    reset(values);
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="example-name">نام</Label>
        <Input id="example-name" placeholder="نام شما" {...register("name")} />
        {errors.name ? <p className="text-small text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="example-email">ایمیل</Label>
        <Input
          id="example-email"
          type="email"
          placeholder="name@example.com"
          dir="ltr"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-small text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">بررسی فرم</Button>
        {isSubmitSuccessful ? (
          <p className="text-small text-success">اعتبارسنجی نمونه موفق بود.</p>
        ) : null}
      </div>
    </form>
  );
}

export { ExampleFormPreview };
