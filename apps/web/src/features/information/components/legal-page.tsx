import Link from "next/link";
import type { ReactNode } from "react";

import {
    InformationPage,
    InformationSection,
} from "@/features/information/components/information-page";

const POLICY_EFFECTIVE_DATE = "۸ سنبله ۱۴۰۵ برابر با ۳۰ آگست ۲۰۲۶";

type LegalPageProps = {
    title: string;
    description: string;
    children: ReactNode;
};

function LegalPage({ title, description, children }: LegalPageProps) {
    return (
        <InformationPage title={title} description={description} className="max-w-4xl">
            <div className="space-y-10">
                <div className="rounded-2xl border border-border bg-card px-5 py-4 text-[14px] leading-7 text-muted-foreground sm:px-6">
                    <p>تاریخ اجرا: {POLICY_EFFECTIVE_DATE}</p>
                    <p>این شرایط بر اساس قوانین نافذ افغانستان تنظیم شده‌اند.</p>
                </div>
                {children}
            </div>
        </InformationPage>
    );
}

function LegalSection({
    number,
    title,
    children,
}: {
    number: number;
    title: string;
    children: ReactNode;
}) {
    return <InformationSection title={`${number}. ${title}`}>{children}</InformationSection>;
}

function ContactPolicyLink() {
    return (
        <Link href="/contact" className="font-semibold text-primary hover:text-primary-hover">
            صفحه تماس با ما
        </Link>
    );
}

export { ContactPolicyLink, LegalPage, LegalSection, POLICY_EFFECTIVE_DATE };
