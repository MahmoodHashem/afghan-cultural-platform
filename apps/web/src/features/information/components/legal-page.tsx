import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  InformationPage,
  InformationSection,
} from "@/features/information/components/information-page";
import { formatPersianNumber } from "@/lib/utils/formatters";

const POLICY_EFFECTIVE_DATE = "۸ سنبله ۱۴۰۵ برابر با ۳۰ آگست ۲۰۲۶";

type LegalPageProps = {
  title: string;
  description: string;
  word?: string;
  children: ReactNode;
};

function LegalPage({ title, description, word, children }: LegalPageProps) {
  return (
    <InformationPage
      eyebrow="قواعد و تعهدها"
      title={title}
      description={description}
      word={word}
      className="max-w-(--container-article)"
    >
      <div className="space-y-10">
        <div className="flex items-start gap-3 rounded-[18px_18px_18px_6px] border border-line-soft bg-tint-navy px-5 py-4 text-[13.5px] leading-[1.9] text-copy sm:px-6">
          <CalendarDaysIcon className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden="true" />
          <div>
            <p>
              <span className="font-bold text-ink">تاریخ اجرا:</span> {POLICY_EFFECTIVE_DATE}
            </p>
            <p>این شرایط بر اساس قوانین نافذ افغانستان تنظیم شده‌اند.</p>
          </div>
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
  return (
    <InformationSection id={`section-${number}`} title={`${formatPersianNumber(number)}. ${title}`}>
      {children}
    </InformationSection>
  );
}

function ContactPolicyLink() {
  return (
    <Link
      href="/contact"
      className="font-bold text-brand-ink underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
    >
      صفحه تماس با ما
    </Link>
  );
}

export { ContactPolicyLink, LegalPage, LegalSection, POLICY_EFFECTIVE_DATE };
