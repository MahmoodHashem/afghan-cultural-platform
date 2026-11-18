"use client";

import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { StatusPage } from "@/components/common/status-page";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PublicRouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-paper">
      <StatusPage
        eyebrow="کمی صبر کنید"
        title="این صفحه بارگذاری نشد"
        word="دوباره"
        description="ممکن است ارتباط با سرور موقتاً قطع شده باشد. دوباره تلاش کنید یا به صفحه اصلی برگردید."
        actions={
          <>
            <Button type="button" variant="pill" className="h-11.5 px-5" onClick={reset}>
              <ArrowPathIcon className="size-4.5" aria-hidden="true" />
              تلاش دوباره
            </Button>
            <Link href="/" className={cn(buttonVariants({ variant: "glass" }), "h-11.5")}>
              <HomeIcon className="size-4" aria-hidden="true" />
              بازگشت به خانه
            </Link>
          </>
        }
      />
    </main>
  );
}

export default PublicRouteError;
