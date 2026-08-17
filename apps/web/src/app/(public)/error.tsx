"use client";

import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function PublicRouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-background">
      <section className="content-container flex min-h-[70vh] items-center justify-center pt-32 pb-16">
        <Card className="w-full max-w-2xl rounded-[28px] border-border bg-card shadow-[0_2px_10px_rgba(0,0,0,.05)]">
          <CardContent className="space-y-6 p-6 text-center sm:p-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-light text-primary">
              <ArrowPathIcon className="size-7" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h1 className="text-[28px] font-bold text-foreground">این صفحه بارگذاری نشد</h1>
              <p className="mx-auto max-w-md text-[15px] leading-8 text-muted-foreground">
                ممکن است ارتباط با سرور موقتاً قطع شده باشد. دوباره تلاش کنید یا به صفحه اصلی
                برگردید.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button type="button" onClick={reset} className="rounded-full">
                تلاش دوباره
              </Button>
              <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                <HomeIcon className="size-4" aria-hidden="true" />
                بازگشت به خانه
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default PublicRouteError;
