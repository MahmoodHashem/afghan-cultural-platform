import { EnvelopeIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/features/information/components/contact-form";
import {
    InformationPage,
    InformationSection,
} from "@/features/information/components/information-page";
import { createRobotsMetadata, createSocialMetadata } from "@/lib/seo/metadata";

const SUPPORT_EMAIL = "shahmahmoodhashemi132@gmail.com";
const CONTACT_DESCRIPTION =
    "برای پرسش‌ها، گزارش مشکل، پیشنهاد اصلاح محتوا یا درخواست حذف حساب و داده‌ها با ما در تماس باشید.";

export const metadata: Metadata = {
    title: "تماس با ما",
    description: CONTACT_DESCRIPTION,
    alternates: { canonical: "/contact" },
    robots: createRobotsMetadata(),
    ...createSocialMetadata({
        title: "تماس با ما | میراث افغانستان",
        description: CONTACT_DESCRIPTION,
        canonicalPath: "/contact",
    }),
};

export default function ContactPage() {
    return (
        <InformationPage
          
            title="تماس با میراث افغانستان"
            description={CONTACT_DESCRIPTION}
            className="max-w-4xl"
        >
            <div className="space-y-10">
                <InformationSection title="فرم تماس">
                    <ContactForm />
                </InformationSection>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12">
                    <div className="space-y-8">
                        <InformationSection title="گزارش مطلب یا پیشنهاد اصلاح">
                            <p>
                                برای گزارش یا اصلاح یک مطلب، از گزینه‌های همان صفحه استفاده کنید تا درخواست مستقیم به
                                بخش مربوطه برسد.
                            </p>
                        </InformationSection>

                        <InformationSection title="حذف حساب و داده‌ها">
                            <p>
                                برای حذف حساب و داده‌های شخصی، با همان ایمیل حساب خود به نشانی پشتیبانی پیام دهید.
                            </p>
                        </InformationSection>
                    </div>

                    <aside className="rounded-[24px] border border-border bg-card p-6 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                            <EnvelopeIcon className="size-6" aria-hidden="true" />
                        </div>
                        <h2 className="mt-5 text-[22px] font-bold text-foreground">ایمیل پشتیبانی</h2>
                        <Link
                            href={`mailto:${SUPPORT_EMAIL}`}
                            dir="ltr"
                            className="mt-4 block break-all rounded-xl border border-primary/20 bg-primary-light/45 px-4 py-3 text-start text-[14px] font-semibold text-primary transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                        >
                            {SUPPORT_EMAIL}
                        </Link>
                    </aside>
                </div>
            </div>
        </InformationPage>
    );
}
