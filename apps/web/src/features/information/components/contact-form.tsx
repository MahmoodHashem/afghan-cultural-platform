"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactFormSchema = z.object({
    name: z.string().trim().min(2, "نام خود را وارد کنید."),
    email: z.string().trim().email("یک آدرس ایمیل معتبر وارد کنید."),
    subject: z.string().trim().min(1, "موضوع پیام را انتخاب کنید."),
    message: z.string().trim().min(10, "پیام را با جزئیات بیشتری بنویسید."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const subjectOptions = [
    "مشکل فنی وب‌سایت",
    "پیشنهاد برای بهبود پلتفرم",
    "مشکل مربوط به حساب کاربری",
    "پرسش درباره انتشار یا بررسی مطالب",
    "گزارش مشکل مربوط به محتوا",
    "همکاری و مشارکت",
    "حقوق نشر و منابع",
    "موضوع دیگر",
] as const;

function ContactForm() {
    const [isPrepared, setIsPrepared] = useState(false);
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    function submit(values: ContactFormValues) {
        const body = [`نام: ${values.name}`, `ایمیل: ${values.email}`, "", values.message].join("\n");
        const mailtoUrl = `mailto:shahmahmoodhashemi132@gmail.com?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;

        setIsPrepared(true);
        window.location.href = mailtoUrl;
    }

    return (
        <form
            onSubmit={form.handleSubmit(submit)}
            className="rounded-[28px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)] sm:p-7"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField htmlFor="contact-name" label="نام" error={form.formState.errors.name?.message}>
                    <Input
                        id="contact-name"
                        autoComplete="name"
                        placeholder="نام خود را وارد کنید"
                        aria-invalid={Boolean(form.formState.errors.name)}
                        {...form.register("name")}
                    />
                </FormField>

                <FormField
                    htmlFor="contact-email"
                    label="ایمیل"
                    error={form.formState.errors.email?.message}
                >
                    <Input
                        id="contact-email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        placeholder="name@example.com"
                        aria-invalid={Boolean(form.formState.errors.email)}
                        {...form.register("email")}
                    />
                </FormField>

                <FormField
                    label="موضوع"
                    htmlFor="contact-subject"
                    error={form.formState.errors.subject?.message}
                    className="sm:col-span-2"
                >
                    <select
                        id="contact-subject"
                        className="h-10 w-full rounded-lg border border-input bg-card px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:text-sm"
                        aria-invalid={Boolean(form.formState.errors.subject)}
                        {...form.register("subject")}
                    >
                        <option value="">موضوع پیام را انتخاب کنید</option>
                        {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField
                    label="پیام"
                    htmlFor="contact-message"
                    error={form.formState.errors.message?.message}
                    className="sm:col-span-2"
                >
                    <Textarea
                        id="contact-message"
                        rows={7}
                        placeholder="مشکل یا درخواست خود را تا حد امکان واضح توضیح دهید."
                        aria-invalid={Boolean(form.formState.errors.message)}
                        {...form.register("message")}
                    />
                </FormField>
            </div>

            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] leading-6 text-muted-foreground">
                    با ارسال پیام، برنامه ایمیل پیش‌فرض دستگاه شما باز می‌شود.
                </p>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                    ارسال پیام
                    <ArrowLeftIcon className="size-4" aria-hidden="true" />
                </Button>
            </div>
            {isPrepared ? (
                <p className="mt-4 text-[14px] text-primary" role="status" aria-live="polite">
                    پیام آماده شد؛ ارسال نهایی را در برنامه ایمیل خود تأیید کنید.
                </p>
            ) : null}
        </form>
    );
}

function FormField({
    label,
    htmlFor,
    error,
    className,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            <Label className="mb-2" htmlFor={htmlFor}>
                {label}
            </Label>
            {children}
            {error ? <p className="mt-2 text-[13px] text-destructive">{error}</p> : null}
        </div>
    );
}

export { ContactForm };
