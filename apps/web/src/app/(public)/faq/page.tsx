import type { Metadata } from "next";

import { type FaqItem, FaqList } from "@/features/information/components/faq-list";
import {
  InformationPage,
  InformationSection,
} from "@/features/information/components/information-page";
import { createRobotsMetadata, createSocialMetadata } from "@/lib/seo/metadata";

const FAQ_DESCRIPTION = "پاسخ پرسش‌های رایج درباره مطالعه، ثبت، بررسی و مشارکت در میراث افغانستان.";

const platformQuestions: FaqItem[] = [
  {
    question: "میراث افغانستان چیست؟",
    answer:
      "میراث افغانستان یک پلتفرم مشارکتی برای گردآوری، مطالعه و حفظ دانش فرهنگی افغانستان است. کاربران می‌توانند مطالب فرهنگی را مطالعه کنند و در تکمیل این مجموعه سهم بگیرند.",
  },
  {
    question: "آیا برای مطالعه مطالب باید حساب کاربری داشته باشم؟",
    answer: "خیر. بیشتر مطالب منتشرشده برای همه قابل مشاهده هستند.",
    details: [
      "برای ثبت مطلب، ارسال دیدگاه، پیشنهاد اصلاح، پسندیدن و برخی امکانات دیگر باید وارد حساب کاربری شوید.",
    ],
  },
  {
    question: "آیا میراث افغانستان منبع رسمی دولتی است؟",
    answer:
      "خیر. میراث افغانستان یک پلتفرم مستقل فرهنگی و مشارکتی است و مطالب آن نباید به‌صورت خودکار موضع رسمی یک اداره یا نهاد دولتی در نظر گرفته شوند.",
  },
];

const contributionQuestions: FaqItem[] = [
  {
    question: "چه کسانی می‌توانند مطلب ثبت کنند؟",
    answer: "کاربران ثبت‌نام‌شده می‌توانند مطلب فرهنگی جدید ایجاد و برای بررسی ارسال کنند.",
  },
  {
    question: "چه نوع مطالبی می‌توانم ثبت کنم؟",
    answer: "مطالب می‌توانند درباره موضوع‌های فرهنگی گوناگون باشند، از جمله:",
    details: [
      "رسم‌ها و آیین‌ها",
      "مکان‌های تاریخی و فرهنگی",
      "روایت‌ها و دانش محلی",
      "غذاهای سنتی، موسیقی و صنایع دستی",
      "معماری، ادبیات و لباس‌های محلی",
      "شخصیت‌ها و موضوعات فرهنگی مرتبط",
    ],
  },
  {
    question: "آیا مطلب من فوراً منتشر می‌شود؟",
    answer:
      "خیر. مطالب جدید ابتدا برای بررسی ارسال می‌شوند و پس از بررسی توسط ناظر، ممکن است تأیید، برای اصلاح برگردانده یا رد شوند.",
  },
  {
    question: "اگر ناظر درخواست تغییر بدهد چه می‌شود؟",
    answer:
      "مطلب دوباره به شما برگردانده می‌شود. می‌توانید تغییرات لازم را انجام دهید و آن را دوباره برای بررسی ارسال کنید.",
  },
  {
    question: "آیا می‌توانم یک مطلب منتشرشده را اصلاح کنم؟",
    answer:
      "اگر اشتباه یا نقصی در یک مطلب مشاهده کردید، از گزینه پیشنهاد اصلاح در صفحه همان مطلب استفاده کنید. پیشنهاد شما توسط ناظر بررسی خواهد شد.",
  },
];

const communityQuestions: FaqItem[] = [
  {
    question: "چگونه می‌توانم یک مطلب یا دیدگاه را گزارش کنم؟",
    answer:
      "در کنار مطالب و دیدگاه‌ها گزینه گزارش وجود دارد. اگر محتوایی نادرست، توهین‌آمیز، ناقض حقوق نشر یا نامناسب باشد، می‌توانید آن را گزارش کنید.",
  },
  {
    question: "آیا می‌توانم برای مطالب منبع اضافه کنم؟",
    answer: "بله. هنگام ثبت مطلب می‌توانید منابع مربوط به آن را وارد کنید.",
    details: ["کتاب و مقاله", "وب‌سایت و آرشیف", "مصاحبه و منبع شفاهی", "سایر منابع معتبر"],
  },
  {
    question: "آیا اطلاعات بدون منبع قابل ثبت است؟",
    answer:
      "در برخی موضوعات فرهنگی، مخصوصاً روایت‌های محلی و دانش شفاهی، ممکن است منبع مکتوب وجود نداشته باشد. در این موارد بهتر است نوع منبع و زمینه معلومات تا حد امکان روشن توضیح داده شود.",
  },
  {
    question: "آیا می‌توانم دیدگاه بگذارم؟",
    answer:
      "بله. کاربران واردشده می‌توانند برای مطالب منتشرشده دیدگاه بگذارند و به دیدگاه‌های دیگران پاسخ دهند.",
  },
  {
    question: "آیا می‌توانم مطالب را ذخیره کنم؟",
    answer:
      "بله. با استفاده از گزینه نشان‌کردن یا ذخیره، می‌توانید مطالب مورد علاقه خود را در حساب‌تان نگه دارید.",
  },
];

const accountQuestions: FaqItem[] = [
  {
    question: "چگونه حساب خود را مدیریت کنم؟",
    answer:
      "از صفحه پروفایل می‌توانید معلومات شخصی، مطالب ثبت‌شده، وضعیت مطالب و سایر فعالیت‌های مرتبط با حساب خود را مشاهده کنید.",
  },
  {
    question: "چگونه می‌توانم در رشد این پلتفرم کمک کنم؟",
    answer:
      "با ثبت یک مطلب فرهنگی، پیشنهاد اصلاح، افزودن منبع، مشارکت در گفت‌وگوها و معرفی پلتفرم به دیگران می‌توانید کمک کنید.",
  },
];

export const metadata: Metadata = {
  title: "پرسش‌های رایج",
  description: FAQ_DESCRIPTION,
  alternates: { canonical: "/faq" },
  robots: createRobotsMetadata(),
  ...createSocialMetadata({
    title: "پرسش‌های رایج | میراث افغانستان",
    description: FAQ_DESCRIPTION,
    canonicalPath: "/faq",
  }),
};

export default function FaqPage() {
  return (
    <InformationPage title="پرسش‌های رایج" description={FAQ_DESCRIPTION} className="max-w-4xl">
      <div className="space-y-10">
        <InformationSection title="درباره پلتفرم">
          <FaqList items={platformQuestions} />
        </InformationSection>
        <InformationSection title="ثبت و بررسی مطالب">
          <FaqList items={contributionQuestions} />
        </InformationSection>
        <InformationSection title="مشارکت و گفتگو">
          <FaqList items={communityQuestions} />
        </InformationSection>
        <InformationSection title="حساب و مشارکت بیشتر">
          <FaqList items={accountQuestions} />
        </InformationSection>
      </div>
    </InformationPage>
  );
}
