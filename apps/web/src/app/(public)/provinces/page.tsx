import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ولایت‌ها | میراث افغانستان",
  description: "مسیر کاوش محتوای فرهنگی افغانستان بر پایه ولایت‌ها.",
};

export default function ProvincesPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="content-container pt-32 pb-16 sm:pt-36">
        <div className="max-w-3xl space-y-5">
          <p className="text-[14px] font-bold text-primary">ولایت‌ها</p>
          <h1 className="text-[38px] font-bold leading-[1.35] text-foreground">
            کاوش میراث فرهنگی بر پایه ولایت‌ها
          </h1>
          <p className="text-[16px] leading-8 text-muted-foreground">
            صفحه اختصاصی ولایت‌ها در گام بعدی تکمیل می‌شود. فعلاً می‌توانید از فیلتر ولایت در کتابخانه
            عمومی استفاده کنید.
          </p>
          <Link
            href="/explore"
            className={cn(buttonVariants({ variant: "default" }), "rounded-full")}
          >
            رفتن به کاوش محتوا
          </Link>
        </div>
      </section>
    </main>
  );
}
