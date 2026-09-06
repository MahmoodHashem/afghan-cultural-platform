import type { ReactNode } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { PageTransition } from "@/components/layout/page-transition";
import { cn } from "@/lib/utils";

type InformationPageProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

type InformationSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

function InformationPage({ title, description, children, className }: InformationPageProps) {
  return (
    <PageTransition>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-card pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div className="content-container">
            <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: title }]} />
            <div className="mt-10 max-w-3xl space-y-4">
              <h1 className="text-[34px] font-bold leading-[1.35] text-foreground sm:text-[46px]">
                {title}
              </h1>
              <p className="max-w-2xl text-[16px] leading-8 text-muted-foreground sm:text-[18px] sm:leading-9">
                {description}
              </p>
            </div>
          </div>
        </section>

        <section className={cn("content-container py-10 sm:py-14", className)}>{children}</section>
      </main>
    </PageTransition>
  );
}

function InformationSection({ title, children, className }: InformationSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-[24px] font-bold leading-8 text-foreground sm:text-[28px]">{title}</h2>
      <div className="space-y-4 text-[16px] leading-8 text-muted-foreground">{children}</div>
    </section>
  );
}

function InformationList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 ps-5 marker:text-primary">
      {items.map((item) => (
        <li key={item} className="ps-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

export { InformationList, InformationPage, InformationSection };
