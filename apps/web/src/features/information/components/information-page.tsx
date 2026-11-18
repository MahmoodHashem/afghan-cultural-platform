import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageHero } from "@/components/common/page-hero";
import { SectionHead } from "@/components/common/section-head";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { PageTransition } from "@/components/layout/page-transition";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InformationPageProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Small handwritten line above the title. */
  eyebrow?: string;
  /** Calligraphic word written large behind the hero (decorative). */
  word?: string;
  actions?: ReactNode;
  /** Ends the page with the shared "write what you know" invitation. */
  withContributeBand?: boolean;
  className?: string;
};

type InformationSectionProps = {
  title: string;
  children: ReactNode;
  id?: string;
  className?: string;
};

/** Shell for about, contact, FAQ and legal pages: navy hero, then a reading-width column. */
function InformationPage({
  title,
  description,
  children,
  eyebrow,
  word,
  actions,
  withContributeBand = false,
  className,
}: InformationPageProps) {
  return (
    <PageTransition>
      <main className="min-h-screen bg-background">
        <PageHero
          breadcrumb={
            <PageBreadcrumb
              tone="onDark"
              items={[{ label: "خانه", href: "/" }, { label: title }]}
            />
          }
          eyebrow={eyebrow}
          title={title}
          description={description}
          word={word}
          actions={actions}
        />

        <section className="content-container py-12 sm:py-16">
          <div className={className}>{children}</div>
        </section>

        {withContributeBand ? <ContributeBand /> : null}
      </main>
    </PageTransition>
  );
}

function InformationSection({ title, children, id, className }: InformationSectionProps) {
  return (
    <section className={cn("scroll-mt-28 space-y-4", className)} aria-labelledby={id}>
      <SectionHead id={id} title={title} size="prose" />
      <div className="space-y-4 text-[15.5px] leading-[2.1] text-copy">{children}</div>
    </section>
  );
}

function InformationList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="relative ps-6">
          <span
            aria-hidden="true"
            className="absolute start-0 top-[0.85em] size-2 rotate-45 rounded-[2px] bg-brand"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Closing invitation shared by information pages. */
function ContributeBand() {
  return (
    <section className="content-container pb-16 sm:pb-20">
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[28px_28px_28px_8px] bg-linear-155 from-primary to-band-red-deep px-6 py-9 text-white shadow-lift sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-[0.05em] -bottom-[0.3em] -z-10 font-calli text-[120px] leading-none text-white opacity-[0.1] select-none"
        >
          میراث
        </span>
        <div className="space-y-2">
          <p className="text-[20px] leading-[1.7] font-bold sm:text-[22px]">
            شما هم چیزی از فرهنگ سرزمین‌تان می‌دانید
          </p>
          <p className="max-w-[52ch] text-[14px] leading-[2] text-white/85">
            قصه، رسم، جا یا هنری که می‌شناسید را بنویسید تا برای دیگران و نسل‌های بعد بماند.
          </p>
        </div>
        <Link
          href="/entries/new"
          className={cn(
            buttonVariants({ variant: "glass" }),
            "h-12 shrink-0 bg-white px-6 text-brand-ink shadow-none hover:bg-white/90",
          )}
        >
          <PencilSquareIcon className="size-5" aria-hidden="true" />
          ثبت مطلب تازه
        </Link>
      </div>
    </section>
  );
}

export { ContributeBand, InformationList, InformationPage, InformationSection };
