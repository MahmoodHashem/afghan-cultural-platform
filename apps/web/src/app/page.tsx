import { ExampleFormPreview } from "@/components/common/example-form-preview";
import { RichTextPreview } from "@/components/common/rich-text-preview";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UiStatePreview } from "@/components/common/ui-state-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { HomeHero } from "@/features/home/components/home-hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HomeHero />
      <section className="relative z-10 -mt-14 rounded-t-[2rem] bg-background pt-16 shadow-[0_-24px_80px_rgba(250,248,243,0.55)] sm:rounded-t-[3rem]">
        <div id="design-preview" className="content-container space-y-10 pb-12">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-small font-medium text-primary">میراث افغانستان</p>
              <h1 className="text-page-title">پیش‌نمایش بنیاد طراحی</h1>
              <p className="max-w-3xl text-body text-muted-foreground">
                این صفحه موقت برای بررسی رنگ‌ها، تایپوگرافی، جهت راست‌به‌چپ و عناصر پایه رابط کاربری
                ساخته شده است.
              </p>
            </div>
            <ThemeToggle />
          </header>

          <section className="space-y-4">
            <h2 className="text-section-title">دکمه‌ها و نشان‌ها</h2>
            <div className="flex flex-wrap gap-3">
              <Button>دکمه اصلی</Button>
              <Button variant="secondary">دکمه دوم</Button>
              <Button variant="outline">دکمه خطی</Button>
              <Button variant="destructive">دکمه حذف</Button>
              <Button variant="link">دکمه موفق</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>اصلی</Badge>
              <Badge className="bg-terracotta text-white">تراکوتا</Badge>
              <Badge className="bg-gold text-foreground">طلایی</Badge>
              <Badge className="bg-success text-white">موفق</Badge>
              <Badge className="bg-warning text-white">هشدار</Badge>
            </div>
          </section>

          <Separator />

          <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <CardTitle>کارت نمونه</CardTitle>
                <CardDescription>
                  این کارت فقط برای نمایش فاصله‌گذاری، حاشیه، سایه و خوانایی متن فارسی است.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-article">
                  میراث فرهنگی افغانستان گستره‌ای از زبان‌ها، روایت‌ها، آیین‌ها و دانش محلی را در بر
                  می‌گیرد. بنیاد طراحی باید آرام، خوانا و مناسب متن‌های فارسی باشد.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>فرم نمونه</CardTitle>
                <CardDescription>نمونه‌ای کوتاه از ورودی‌ها و انتخاب‌گر.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان</Label>
                  <Input id="title" placeholder="نمونه: داستان محلی" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">دسته‌بندی</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="یک دسته را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">روایت</SelectItem>
                      <SelectItem value="music">موسیقی</SelectItem>
                      <SelectItem value="craft">هنر دستی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">توضیح</Label>
                  <Textarea id="description" placeholder="چند جمله کوتاه بنویسید..." />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>فرم نمونه</CardTitle>
                <CardDescription>
                  اعتبارسنجی کوتاه با React Hook Form و Zod، بدون ارسال درخواست.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExampleFormPreview />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>وضعیت رابط کاربری</CardTitle>
                <CardDescription>
                  نمونه کوچک Zustand برای وضعیت‌های عمومی رابط کاربری.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UiStatePreview />
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>ویرایشگر متن نمونه</CardTitle>
                <CardDescription>
                  پایه Tiptap برای متن فارسی راست‌به‌چپ، بدون ذخیره‌سازی محتوا.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextPreview />
              </CardContent>
            </Card>
          </section>

          <section className="article-container space-y-4">
            <h2 className="text-section-title">نمونه تایپوگرافی</h2>
            <div className="space-y-3">
              <p className="text-display">نمایش بزرگ</p>
              <p className="text-page-title">عنوان صفحه</p>
              <p className="text-section-title">عنوان بخش</p>
              <p className="text-card-title">عنوان کارت</p>
              <p className="text-body">متن بدنه برای رابط کاربری و توضیحات کوتاه.</p>
              <p className="text-article">
                متن مقاله با اندازه بزرگ‌تر برای خواندن راحت‌تر نوشته‌های طولانی فارسی.
              </p>
              <p className="text-small text-muted-foreground">متن کوچک و کم‌رنگ برای جزئیات.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
