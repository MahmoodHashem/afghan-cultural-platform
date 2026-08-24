import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import type * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="صفحه‌بندی"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = React.ComponentProps<typeof Link> & {
  isActive?: boolean;
};

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size: "icon" }),
        "rounded-lg",
        isActive && "border-primary/30 bg-primary-light/35 text-primary",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, children, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="رفتن به صفحه قبلی"
      className={cn("w-auto gap-1 px-3", className)}
      {...props}
    >
      <ChevronRightIcon className="size-4" aria-hidden="true" />
      {children ?? <span>قبلی</span>}
    </PaginationLink>
  );
}

function PaginationNext({ className, children, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="رفتن به صفحه بعدی"
      className={cn("w-auto gap-1 px-3", className)}
      {...props}
    >
      {children ?? <span>بعدی</span>}
      <ChevronLeftIcon className="size-4" aria-hidden="true" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <EllipsisHorizontalIcon className="size-4" />
      <span className="sr-only">صفحه‌های بیشتر</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
