import type { Metadata } from "next";

import {
    InformationList,
    InformationPage,
    InformationSection,
} from "@/features/information/components/information-page";
import { createRobotsMetadata, createSocialMetadata } from "@/lib/seo/metadata";

const ABOUT_DESCRIPTION =
    "میراث افغانستان یک پلتفرم مشارکتی برای گردآوری، حفظ و دسترسی بهتر به دانش فرهنگی افغانستان است.";

export const metadata: Metadata = {
    title: "درباره ما",
    description: ABOUT_DESCRIPTION,
    alternates: { canonical: "/about" },
    robots: createRobotsMetadata(),
    ...createSocialMetadata({
        title: "درباره ما | میراث افغانستان",
        description: ABOUT_DESCRIPTION,
        canonicalPath: "/about",
    }),
};

export default function AboutPage() {
    return (
        <InformationPage
            title="دانش فرهنگی افغانستان، با مشارکت مردم"
            description={ABOUT_DESCRIPTION}
            className="max-w-4xl"
        >
            <div className="space-y-12">
                <InformationSection title="فرهنگ افغانستان را با هم ثبت می‌کنیم">
                    <p>
                        فرهنگ افغانستان تنها در کتاب‌ها و اسناد رسمی خلاصه نمی‌شود. بخش بزرگی از آن در خاطرات
                        مردم، روایت‌های محلی، رسم‌ها و آیین‌ها، غذاها، موسیقی، صنایع دستی، مکان‌های تاریخی و
                        تجربه‌های نسل‌های مختلف زنده مانده است.
                    </p>
                    <p>
                        هدف میراث افغانستان این است که این دانش پراکنده در یک مکان قابل دسترس، قابل جست‌وجو و
                        قابل تکمیل باشد؛ مکانی که در آن روایت‌های گوناگون با احترام و دقت ثبت شوند.
                    </p>
                </InformationSection>

                <InformationSection title="مأموریت ما">
                    <p>
                        مأموریت ما کمک به ثبت و حفظ دانش فرهنگی افغانستان و فراهم‌کردن زمینه برای مشارکت مردم در
                        این فرایند است.
                    </p>
                    <InformationList
                        items={[
                            "مطالب فرهنگی را جست‌وجو و مطالعه کنند.",
                            "بر اساس ولایت، موضوع و نوع مطلب به کشف محتوا بپردازند.",
                            "معلومات و دانش فرهنگی خود را ثبت کنند.",
                            "برای مطالب موجود پیشنهاد اصلاح بفرستند.",
                            "در بخش دیدگاه‌ها گفت‌وگو کنند و مطالب مورد علاقه خود را ذخیره کنند.",
                            "محتوای نادرست یا نامناسب را گزارش دهند.",
                        ]}
                    />
                </InformationSection>

                <InformationSection title="چرا یک پلتفرم مشارکتی؟">
                    <p>
                        بخش بزرگی از دانش فرهنگی در اختیار خود مردم است. گاهی یک رسم محلی، یک روایت قدیمی یا
                        معلومات مربوط به یک مکان تاریخی در منابع آنلاین ثبت نشده است، اما مردم همان منطقه آن را
                        می‌شناسند.
                    </p>
                    <p>
                        میراث افغانستان تلاش می‌کند این دانش را از حالت پراکنده خارج کند و زمینه‌ای فراهم سازد تا
                        مردم در ثبت آن سهم بگیرند.
                    </p>
                </InformationSection>

                <InformationSection title="چگونه کیفیت مطالب حفظ می‌شود؟">
                    <p>
                        مشارکتی‌بودن به این معنا نیست که هر مطلب بدون بررسی منتشر می‌شود. مطالب ارسال‌شده پیش از
                        انتشار بررسی می‌شوند و کاربران می‌توانند برای مطالب منتشرشده پیشنهاد اصلاح بفرستند یا
                        محتوای مشکل‌دار را گزارش دهند.
                    </p>
                    <p>
                        منابع و مآخذ نیز بخش مهمی از هر مطلب هستند و در صورت موجود بودن، همراه محتوا نمایش داده
                        می‌شوند. روایت‌های محلی و تجربه‌های شخصی نیز با مشخص‌شدن ماهیت آن‌ها، جای خود را در این
                        مجموعه دارند.
                    </p>
                </InformationSection>

                <InformationSection title="چشم‌انداز ما">
                    <p>
                        ما می‌خواهیم میراث افغانستان به یک مرجع باز و قابل اعتماد برای شناخت فرهنگ افغانستان
                        تبدیل شود؛ مرجعی که با مشارکت مردم رشد کند و دانش فرهنگی را برای نسل‌های آینده حفظ نماید.
                    </p>
                    <p className="border-s-2 border-primary ps-4 text-foreground">
                        میراث افغانستان توسط شاه محمود هاشمی توسعه داده می‌شود و با مشارکت جامعه رشد خواهد کرد.
                    </p>
                </InformationSection>
            </div>
        </InformationPage>
    );
}
