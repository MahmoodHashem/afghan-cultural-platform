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
  className?: string;
};

function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={cn("text-[13px] font-medium", className)} aria-label="مسیر صفحه">
      <BreadcrumbList className="gap-2 text-[13px] text-muted-foreground">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || !item.href;
          const itemKey = item.href ?? item.label;

          return (
            <Fragment key={itemKey}>
              <BreadcrumbItem className="gap-2">
                {isCurrent ? (
                  <BreadcrumbPage className="line-clamp-1 max-w-[220px] font-semibold text-foreground sm:max-w-none">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={item.href ?? "/"} />}
                    className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
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
