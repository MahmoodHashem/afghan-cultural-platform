import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

type PageBreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBreadcrumbProps = {
  items: PageBreadcrumbItem[];
  /** `onDark` is used inside the navy page hero. */
  tone?: "default" | "onDark";
  className?: string;
};

function PageBreadcrumb({ items, tone = "default", className }: PageBreadcrumbProps) {
  const onDark = tone === "onDark";

  return (
    <Breadcrumb className={cn("text-[12px] font-medium", className)} aria-label="مسیر صفحه">
      <BreadcrumbList className={cn("gap-2 text-[12px]", onDark ? "text-white/60" : "text-faint")}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || !item.href;
          const itemKey = item.href ?? item.label;

          return (
            <Fragment key={itemKey}>
              <BreadcrumbItem className="gap-2">
                {isCurrent ? (
                  <BreadcrumbPage
                    className={cn(
                      "line-clamp-1 max-w-[220px] font-semibold sm:max-w-none",
                      onDark ? "text-white/85" : "text-ink",
                    )}
                  >
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={item.href ?? "/"} />}
                    className={cn(
                      "rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                      onDark
                        ? "hover:text-white focus-visible:outline-white"
                        : "hover:text-brand-ink focus-visible:outline-ring",
                    )}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export type { PageBreadcrumbItem };
export { PageBreadcrumb };
