import { ArrowLeftIcon, ChevronLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHero } from "@/components/common/page-hero";
import { SectionHead } from "@/components/common/section-head";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/features/auth/components/field-error";

import { OverlayDemo } from "./overlay-demo";

export const metadata: Metadata = {
  title: "مرجع رابط کاربری",
  robots: { index: false, follow: false },
};

/**
 * Internal design-system reference used to review the visual migration before production pages change.
 * Available in development, or in other environments only when NEXT_PUBLIC_UI_REFERENCE is "1".
 */
function isReferenceEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_UI_REFERENCE === "1";
}

const introText =
  "این صفحه پیش از تغییر صفحه‌های اصلی، رنگ‌ها، قلم‌ها، اندازه‌ها و اجزای پایه را نشان می‌دهد. حالت روشن و تاریک را با دکمه‌ی زیر بررسی کنید.";

const fontWeightNote =
  "قلم «کلمه» با چهار وزن نصب شده است: معمولی ۴۰۰، متوسط ۵۰۰، نیم‌پررنگ ۶۰۰ و پررنگ ۷۰۰.";

const cardSample =
  "مسجد جامع هرات از بزرگ‌ترین مسجدهای تاریخی افغانستان است و کاشی‌های آن هنوز در کارگاه کنار مسجد ساخته می‌شوند.";

const heroDescription =
  "مقاله‌ها و روایت‌هایی درباره‌ی فرهنگ، تاریخ، ولایت‌ها و مشاهیر افغانستان؛ با جست‌وجو و دسته‌بندی بیابید.";

const paletteSwatches = [
  { name: "paper", className: "bg-paper", note: "زمینه‌ی صفحه" },
  { name: "surface", className: "bg-surface", note: "کارت‌ها و پنل‌ها" },
  { name: "line", className: "bg-line", note: "حاشیه‌ی کنترل‌ها" },
  { name: "line-soft", className: "bg-line-soft", note: "حاشیه‌ی کارت، هاور" },
  { name: "ink", className: "bg-ink", note: "عنوان‌ها" },
  { name: "copy", className: "bg-copy", note: "متن اصلی" },
  { name: "faint", className: "bg-faint", note: "متن فرعی و تاریخ" },
  { name: "brand", className: "bg-brand", note: "رنگ شاخص" },
  { name: "brand-ink", className: "bg-brand-ink", note: "قرمزِ متن و پیوند" },
  { name: "brand-soft", className: "bg-brand-soft", note: "زمینه‌ی برچسب" },
  { name: "gold", className: "bg-gold", note: "تزئینی، نه برای متن" },
  { name: "ok", className: "bg-ok", note: "موفقیت" },
] as const;

const fixedSwatches = [
  { name: "hero-navy", className: "bg-hero-navy" },
  { name: "hero-navy-deep", className: "bg-hero-navy-deep" },
  { name: "band-red-deep", className: "bg-band-red-deep" },
  { name: "footer", className: "bg-footer" },
  { name: "lapis", className: "bg-lapis" },
  { name: "turquoise", className: "bg-turquoise" },
  { name: "saffron", className: "bg-saffron" },
  { name: "anar", className: "bg-anar" },
] as const;

const typeScale = [
  { name: "text-display", className: "text-display", sample: "میراث افغانستان" },
  {
    name: "text-page-title",
    className: "text-page-title",
    sample: "مسجد جامع هرات و کاشی‌های فیروزه‌ای",
  },
  { name: "text-section-title", className: "text-section-title", sample: "تازه‌ترین مطالب" },
  {
    name: "text-card-title",
    className: "text-card-title",
    sample: "بامیان؛ دره‌ای میان تاریخ و کوه",
  },
  {
    name: "text-card-title-sm",
    className: "text-card-title-sm",
    sample: "گُند افغانی و هنر سوزن‌دوزی",
  },
  {
    name: "text-article",
    className: "text-article text-copy",
    sample:
      "باغ بابر در دامنه‌ی کوه شیردروازه‌ی کابل، یکی از کهن‌ترین باغ‌های تاریخی افغانستان است که روایت شهر را از روزگار تیموریان تا امروز در خود نگه داشته است.",
  },
  {
    name: "text-lead",
    className: "text-lead text-copy",
    sample: "خلاصه‌ای کوتاه در دو خط زیر عنوان کارت.",
  },
  { name: "text-meta", className: "text-meta text-faint", sample: "۲۷ عقرب ۱۴۰۵ · ولایت هرات" },
  { name: "text-micro", className: "text-micro text-faint", sample: "۱۲ دیدگاه · ۴ دقیقه مطالعه" },
] as const;

const radii = [
  { name: "rounded-bubble", className: "rounded-bubble", note: "۲۲ / دنباله ۶ — رسانه، کاشی‌ها" },
  { name: "rounded-bubble-md", className: "rounded-bubble-md", note: "۱۸ / ۶ — دیالوگ‌ها" },
  { name: "rounded-bubble-sm", className: "rounded-bubble-sm", note: "۱۲ / ۴ — دکمه‌های کنترلی" },
  { name: "rounded-card", className: "rounded-card", note: "۱۸ — کارت‌های محتوا" },
  { name: "rounded-control", className: "rounded-control", note: "۱۲ — ورودی‌ها" },
  { name: "rounded-arch", className: "rounded-arch", note: "طاق — چهره‌ها و ولایت‌ها" },
] as const;

const shadows = [
  { name: "shadow-card", className: "shadow-card" },
  { name: "shadow-lift", className: "shadow-lift" },
  { name: "shadow-menu", className: "shadow-menu" },
  { name: "shadow-float", className: "shadow-float" },
] as const;

export default function UiReferencePage() {
  if (!isReferenceEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <section className="relative overflow-hidden bg-linear-150 from-hero-navy to-hero-navy-deep py-14 text-white">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 end-0 font-calli text-[180px] leading-none opacity-10 select-none"
        >
          میراث
        </span>
        <div className="content-container relative space-y-4">
          <p className="font-hand text-[22px] text-gold">مرجع طراحی</p>
          <h1 className="text-display">زبان دیداری تازه‌ی میراث افغانستان</h1>
          <p className="max-w-2xl text-body text-white/80">{introText}</p>
          <ThemeToggle />
        </div>
      </section>

      <div className="content-container space-y-16 pt-12">
        <ReferenceSection title="قلم‌ها" word="قلم">
          <div className="grid gap-5 lg:grid-cols-3">
            <FontCard
              name="کلمه (Kalameh)"
              role="قلم اصلی رابط کاربری: متن، عنوان‌ها، دکمه‌ها"
              className="font-sans text-[28px]"
            />
            <FontCard
              name="ریحان (Reyhan)"
              role="خوشنویسی: واژه‌های پس‌زمینه، نقل‌قول‌ها، عنوان‌های تزئینی"
              className="font-calli text-[40px] leading-[1.6]"
            />
            <FontCard
              name="لیلا (Leila)"
              role="دست‌نویس: شماره‌ها، برچسب‌های کوچک تزئینی"
              className="font-hand text-[34px]"
            />
          </div>
          <p className="mt-4 text-small text-faint">{fontWeightNote}</p>
        </ReferenceSection>

        <ReferenceSection title="رنگ‌ها" word="رنگ">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {paletteSwatches.map((swatch) => (
              <figure key={swatch.name} className="space-y-2">
                <div className={`h-16 rounded-bubble-sm border border-line ${swatch.className}`} />
                <figcaption>
                  <span className="block font-mono text-micro text-ink" dir="ltr">
                    {swatch.name}
                  </span>
                  <span className="block text-micro text-faint">{swatch.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {fixedSwatches.map((swatch) => (
              <figure key={swatch.name} className="space-y-1">
                <div className={`h-12 rounded-bubble-sm ${swatch.className}`} />
                <figcaption className="font-mono text-micro text-faint" dir="ltr">
                  {swatch.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title="اندازه‌ی نوشته‌ها" word="واژه">
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-surface px-6 shadow-card">
            {typeScale.map((item) => (
              <div
                key={item.name}
                className="grid gap-2 py-5 md:grid-cols-[180px_1fr] md:items-baseline"
              >
                <span className="font-mono text-micro text-faint" dir="ltr">
                  {item.name}
                </span>
                <p className={item.className}>{item.sample}</p>
              </div>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title="گوشه‌ها و سایه‌ها" word="شکل">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {radii.map((radius) => (
              <figure key={radius.name} className="space-y-2">
                <div className={`h-24 bg-brand-soft ring-1 ring-brand/30 ${radius.className}`} />
                <figcaption>
                  <span className="block font-mono text-micro text-ink" dir="ltr">
                    {radius.name}
                  </span>
                  <span className="block text-micro text-faint">{radius.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {shadows.map((shadow) => (
              <div
                key={shadow.name}
                className={`grid h-24 place-items-center rounded-card bg-surface font-mono text-micro text-faint ${shadow.className}`}
                dir="ltr"
              >
                {shadow.name}
              </div>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title="دکمه‌ها" word="کنش">
          <div className="space-y-5 rounded-card border border-line-soft bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-3">
              <Button>ثبت مطلب</Button>
              <Button variant="outline">ورود / ثبت‌نام</Button>
              <Button variant="secondary">ولایت‌ها</Button>
              <Button variant="ghost">انصراف</Button>
              <Button variant="destructive">حذف</Button>
              <Button variant="link">بیشتر بخوانید</Button>
              <Button disabled>غیرفعال</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="pill">حمایت از میراث</Button>
              <Button variant="pill" size="lg">
                افزودن مطلب تازه
              </Button>
              <Button variant="cta">
                ادامه‌ی مطلب
                <ArrowLeftIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
              <Button variant="more" size="sm">
                همه‌ی مطالب
                <ChevronLeftIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="جست‌وجو">
                <MagnifyingGlassIcon aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-bubble bg-linear-155 from-hero-navy to-hero-navy-deep p-5">
              <Button variant="glass">ذخیره</Button>
              <Button variant="glass">تنظیمات خواندن</Button>
              <Button variant="pill">هم‌رسانی</Button>
            </div>
          </div>
        </ReferenceSection>

        <ReferenceSection title="برچسب‌ها و وضعیت‌ها" word="نشان">
          <div className="space-y-5 rounded-card border border-line-soft bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="chip">معماری اسلامی</Badge>
              <Badge variant="corner">هرات</Badge>
              <Badge>تازه</Badge>
              <Badge variant="outline">صنایع دستی</Badge>
              <Badge variant="count">۱۲۴</Badge>
              <span className="rounded-full bg-hero-navy p-2">
                <Badge variant="glass">بامیان</Badge>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="success">منتشرشده</StatusBadge>
              <StatusBadge tone="warning">در انتظار بررسی</StatusBadge>
              <StatusBadge tone="danger">ردشده</StatusBadge>
              <StatusBadge tone="info">در حال بررسی</StatusBadge>
              <StatusBadge tone="neutral">پیش‌نویس</StatusBadge>
              <StatusBadge tone="muted">بایگانی</StatusBadge>
            </div>
          </div>
        </ReferenceSection>

        <ReferenceSection title="فرم" word="نوشتن">
          <div className="grid gap-6 rounded-card border border-line-soft bg-surface p-6 shadow-card lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ui-ref-title">عنوان مطلب</Label>
              <Input id="ui-ref-title" placeholder="مثلاً: منار جام" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ui-ref-email">ایمیل</Label>
              <Input
                id="ui-ref-email"
                aria-invalid="true"
                aria-describedby="ui-ref-email-error"
                defaultValue="name@"
                dir="ltr"
              />
              <FieldError id="ui-ref-email-error" message="نشانی ایمیل معتبر نیست." />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="ui-ref-summary">خلاصه</Label>
              <Textarea id="ui-ref-summary" placeholder="چند جمله درباره‌ی این مطلب بنویسید…" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ui-ref-terms" defaultChecked />
              <Label htmlFor="ui-ref-terms" className="font-medium">
                شرایط استفاده را می‌پذیرم
              </Label>
            </div>
          </div>
        </ReferenceSection>

        <ReferenceSection title="زبانه‌ها، صفحه‌بندی و مسیر" word="راه">
          <div className="space-y-6 rounded-card border border-line-soft bg-surface p-6 shadow-card">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">همه</TabsTrigger>
                <TabsTrigger value="literature">ادبیات</TabsTrigger>
                <TabsTrigger value="places">بناهای تاریخی</TabsTrigger>
                <TabsTrigger value="crafts">صنایع دستی</TabsTrigger>
              </TabsList>
            </Tabs>
            <Pagination className="mx-0 justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="/ui" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="/ui" isActive>
                    ۱
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="/ui">۲</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="/ui">۳۴</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="/ui" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/ui">خانه</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/ui">ولایت‌ها</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>هرات</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </ReferenceSection>

        <ReferenceSection title="کارت، پنجره و منو" word="قاب">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>مسجد جامع هرات</CardTitle>
                <CardDescription>کاشی‌کاری فیروزه‌ای و ایوان‌های تیموری</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lead text-copy">{cardSample}</p>
                <div className="flex gap-2">
                  <Badge variant="chip">معماری</Badge>
                  <Badge variant="outline">هرات</Badge>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4 rounded-card border border-line-soft bg-surface p-6 shadow-card">
              <p className="text-small text-faint">دیالوگ، منوی کشویی و راهنمای کوتاه:</p>
              <OverlayDemo />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </ReferenceSection>

        <ReferenceSection title="سرفصل بخش" word="بخش">
          <div className="space-y-10 rounded-card border border-line-soft bg-surface p-6 shadow-card">
            <SectionHead
              title="تازه‌ترین مطالب"
              word="میراث"
              action={{ href: "/ui", label: "همه‌ی مطالب" }}
            />
            <SectionHead
              title="ولایت‌ها"
              word="سرزمین"
              action={{ href: "/ui", label: "همه‌ی ولایت‌ها" }}
            />
            <SectionHead title="زندگی و آثار" word="شعر" size="prose" as="h3" />
            <div className="rounded-bubble bg-linear-140 from-primary to-band-red-deep p-6">
              <SectionHead
                title="پربازدیدترین‌ها"
                word="فرهنگ"
                tone="band"
                action={{ href: "/ui", label: "همه" }}
              />
            </div>
          </div>
        </ReferenceSection>

        <ReferenceSection title="سربرگ صفحه" word="آغاز">
          <div className="overflow-hidden rounded-bubble">
            <PageHero
              className="pt-10 sm:pt-12"
              as="h2"
              eyebrow="بایگانی میراث"
              title="همه‌ی مطالب"
              description={heroDescription}
              word="مطلب"
              breadcrumb={<span className="text-meta">خانه / مطالب</span>}
              actions={
                <>
                  <Button variant="glass">ذخیره‌ی جست‌وجو</Button>
                  <Button variant="pill">افزودن مطلب</Button>
                </>
              }
            />
          </div>
        </ReferenceSection>

        <ReferenceSection title="وضعیت خالی" word="خالی">
          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyState
              description="مطلبی با «سرود باستانی» پیدا نشد. واژه‌ی دیگری را بیازمایید یا فهرست کامل را ببینید."
              action={<Button variant="pill">نمایش همه‌ی مطالب</Button>}
            />
            <EmptyState
              size="compact"
              title="هنوز مطلبی ذخیره نکرده‌اید"
              description="مطالبی را که دوست دارید ذخیره کنید تا اینجا بمانند."
            />
          </div>
        </ReferenceSection>
      </div>
    </main>
  );
}

function ReferenceSection({
  title,
  word,
  children,
}: {
  title: string;
  word: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="relative isolate ps-5 text-section-title text-ink before:absolute before:inset-s-0 before:top-1/2 before:h-6.5 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-brand">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-s-9 top-1/2 -z-10 -translate-y-1/2 font-calli text-[54px] leading-none text-ink opacity-[0.07] select-none"
        >
          {word}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function FontCard({ name, role, className }: { name: string; role: string; className: string }) {
  return (
    <div className="space-y-3 rounded-bubble border border-line-soft bg-surface p-6 shadow-card">
      <p className={`text-ink ${className}`}>فرهنگ افغانستان ۱۴۰۵</p>
      <div>
        <p className="text-card-title-sm text-ink">{name}</p>
        <p className="text-micro text-faint">{role}</p>
      </div>
    </div>
  );
}
