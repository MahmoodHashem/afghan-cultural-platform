import type { ReactNode } from "react";

/** Admin page title: red bar heading (as SectionHead), muted description and actions at the end. */
function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-line-soft pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="relative ps-4 text-[24px] leading-[1.7] font-bold text-ink before:absolute before:inset-s-0 before:top-[calc(50%-12px)] before:h-6 before:w-[5px] before:rounded-full before:bg-brand sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-[70ch] ps-4 text-[14px] leading-[1.9] text-copy">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export { AdminPageHeader };
