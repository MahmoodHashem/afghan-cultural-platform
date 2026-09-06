import type { Metadata } from "next";

import { InformationList } from "@/features/information/components/information-page";
import {
    ContactPolicyLink,
    LegalPage,
    LegalSection,
} from "@/features/information/components/legal-page";
import { createRobotsMetadata, createSocialMetadata } from "@/lib/seo/metadata";

const TERMS_DESCRIPTION =
    "شرایط استفاده از میراث افغانستان برای ایجاد محیطی سالم، قابل اعتماد و محترمانه برای ثبت و اشتراک دانش فرهنگی افغانستان.";

export const metadata: Metadata = {
    title: "شرایط استفاده",
    description: TERMS_DESCRIPTION,
    alternates: { canonical: "/terms" },
    robots: createRobotsMetadata(),
    ...createSocialMetadata({
        title: "شرایط استفاده | میراث افغانستان",
        description: TERMS_DESCRIPTION,
        canonicalPath: "/terms",
    }),
};

export default function TermsPage() {
    return (
        <LegalPage title="شرایط استفاده" description={TERMS_DESCRIPTION}>
            <div className="space-y-10">
                <p className="text-[16px] leading-8 text-muted-foreground">
                    با استفاده از وب‌سایت میراث افغانستان، شما با شرایط زیر موافقت می‌کنید. هدف این شرایط، ایجاد
                    محیطی سالم، قابل اعتماد و محترمانه برای ثبت و اشتراک دانش فرهنگی افغانستان است.
                </p>

                <LegalSection number={1} title="استفاده از پلتفرم">
                    <p>
                        شما می‌توانید مطالب منتشرشده را بدون ایجاد حساب کاربری مطالعه کنید. برای ثبت مطلب، ارسال
                        دیدگاه، پیشنهاد اصلاح و سایر امکانات مشارکتی، ایجاد حساب کاربری لازم است.
                    </p>
                </LegalSection>

                <LegalSection number={2} title="حساب کاربری">
                    <p>شما مسئول حفظ امنیت حساب خود هستید. لطفاً:</p>
                    <InformationList
                        items={[
                            "معلومات واقعی و قابل استفاده ارائه کنید.",
                            "رمز عبور خود را در اختیار دیگران قرار ندهید.",
                            "از حساب دیگران بدون اجازه استفاده نکنید.",
                        ]}
                    />
                    <p>در صورت مشاهده فعالیت غیرعادی در حساب خود، از طریق صفحه تماس با ما اطلاع دهید.</p>
                </LegalSection>

                <LegalSection number={3} title="محتوای ارسالی کاربران">
                    <p>شما مسئول محتوایی هستید که در پلتفرم ثبت می‌کنید. نباید محتوایی ارسال کنید که:</p>
                    <InformationList
                        items={[
                            "عمداً نادرست یا گمراه‌کننده باشد.",
                            "توهین‌آمیز یا تبعیض‌آمیز باشد.",
                            "حریم خصوصی دیگران را نقض کند.",
                            "حقوق نشر دیگران را نقض کند.",
                            "تبلیغاتی یا اسپم باشد.",
                            "با هدف پلتفرم مرتبط نباشد.",
                        ]}
                    />
                </LegalSection>

                <LegalSection number={4} title="منابع و اعتبار معلومات">
                    <p>
                        کاربران تشویق می‌شوند برای مطالب خود منابع معتبر ارائه کنند. اگر مطلبی بر اساس روایت
                        شفاهی، تجربه شخصی یا دانش محلی نوشته شده است، بهتر است این موضوع به‌صورت واضح ذکر شود.
                    </p>
                </LegalSection>

                <LegalSection number={5} title="بررسی و مدیریت محتوا">
                    <p>مطالب ممکن است پیش از انتشار بررسی شوند. مدیران و ناظران می‌توانند در موارد لازم:</p>
                    <InformationList
                        items={[
                            "درخواست اصلاح کنند.",
                            "یک مطلب را رد کنند.",
                            "محتوای مشکل‌دار را پنهان کنند.",
                            "محتوای ناقض شرایط استفاده را حذف یا محدود کنند.",
                        ]}
                    />
                </LegalSection>

                <LegalSection number={6} title="پیشنهادهای اصلاح">
                    <p>
                        کاربران می‌توانند برای مطالب منتشرشده پیشنهاد اصلاح ارسال کنند. ارسال پیشنهاد به معنی
                        اعمال خودکار آن نیست و پیشنهادها پیش از اعمال بررسی می‌شوند.
                    </p>
                </LegalSection>

                <LegalSection number={7} title="دیدگاه‌ها و گفتگوها">
                    <p>
                        کاربران باید در گفتگوها احترام متقابل را رعایت کنند. دیدگاه‌های توهین‌آمیز، تهدیدآمیز،
                        تبعیض‌آمیز یا اسپم ممکن است حذف یا پنهان شوند.
                    </p>
                </LegalSection>

                <LegalSection number={8} title="حقوق نشر">
                    <p>
                        کاربران باید تنها محتوایی را ارسال کنند که حق استفاده از آن را دارند. هنگام استفاده از
                        کتاب، مقاله، تصویر، وب‌سایت یا منابع دیگر، منبع را ذکر کنید و در موارد لازم اجازه استفاده
                        داشته باشید.
                    </p>
                </LegalSection>

                <LegalSection number={9} title="مسئولیت معلومات">
                    <p>
                        میراث افغانستان تلاش می‌کند کیفیت و اعتبار مطالب را از طریق بررسی، منابع، پیشنهادهای
                        اصلاح و گزارش‌های کاربران بهتر سازد؛ با این حال، هیچ سیستم مشارکتی نمی‌تواند صحت کامل تمام
                        مطالب را تضمین کند. در موارد حساس یا تخصصی، معلومات را با منابع مستقل نیز بررسی کنید.
                    </p>
                </LegalSection>

                <LegalSection number={10} title="تعلیق یا محدودکردن حساب">
                    <p>
                        در صورت سوءاستفاده از پلتفرم یا نقض مکرر شرایط استفاده، ممکن است حساب کاربری به‌طور موقت
                        یا دایمی محدود یا تعلیق شود.
                    </p>
                </LegalSection>

                <LegalSection number={11} title="تغییر شرایط">
                    <p>
                        ممکن است این شرایط در آینده به‌روزرسانی شوند. نسخه جدید از طریق همین صفحه در دسترس خواهد
                        بود.
                    </p>
                </LegalSection>

                <LegalSection number={12} title="تماس">
                    <p>
                        اگر درباره این شرایط پرسشی دارید، می‌توانید از <ContactPolicyLink /> استفاده کنید.
                    </p>
                </LegalSection>
            </div>
        </LegalPage>
    );
}
