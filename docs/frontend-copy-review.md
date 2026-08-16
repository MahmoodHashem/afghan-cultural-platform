# Frontend Copy Review

این فایل برای بازبینی متن‌های فارسی رابط کاربری فرانت‌اند است. هدف این است که پیش از ادامه‌ی توسعه، لحن سایت یک‌دست، طبیعی و مناسب مخاطب فارسی‌زبان باشد.

قاعده‌ی واژگان فعلی:

- `محتوا`: فقط برای زمینه‌های عمومی، فنی، ساختاری یا مدیریتی مثل `نوع محتوا`.
- `مطلب`: واژه‌ی پیش‌فرض برای یک آیتم منتشرشده در رابط عمومی.
- `نوشته`: برای بخش‌های گرم‌تر و editorial، مثل صفحه اصلی.
- `روایت`: فقط وقتی واقعاً جنس محتوا داستان، خاطره یا روایت شفاهی است.
- `اثر`: فقط برای اثر هنری یا ادبی واقعی.
- `کاوش`: کم‌استفاده و فقط جایی که حس برند یا صفحه‌ی موضوعی را بهتر می‌کند.

## Metadata

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/app/layout.tsx` | عنوان پیش‌فرض | `میراث افغانستان` |
| `apps/web/src/app/page.tsx` | عنوان صفحه اصلی | `میراث افغانستان \| فرهنگ و تاریخ افغانستان` |
| `apps/web/src/app/page.tsx` | توضیح صفحه اصلی | `جایی برای خواندن و ثبت مطالبی درباره فرهنگ، تاریخ، ولایت‌ها، شخصیت‌ها و دانش محلی افغانستان.` |
| `apps/web/src/app/page.tsx` | Open Graph title | `میراث افغانستان` |
| `apps/web/src/app/page.tsx` | Open Graph description | `جایی برای گردآوری و شناخت فرهنگ افغانستان.` |
| `apps/web/src/app/(public)/explore/page.tsx` | عنوان | `مطالب فرهنگی \| میراث افغانستان` |
| `apps/web/src/app/(public)/explore/page.tsx` | توضیح | `مطالب فرهنگی افغانستان را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.` |
| `apps/web/src/app/(public)/explore/page.tsx` | Open Graph title | `مطالب فرهنگی \| میراث افغانستان` |
| `apps/web/src/app/(public)/explore/page.tsx` | Open Graph description | `مطالب منتشرشده درباره فرهنگ افغانستان.` |
| `apps/web/src/app/(public)/provinces/page.tsx` | عنوان | `ولایت‌ها \| میراث افغانستان` |
| `apps/web/src/app/(public)/provinces/page.tsx` | توضیح | `با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید.` |
| `apps/web/src/app/(public)/categories/page.tsx` | عنوان | `دسته‌بندی‌ها \| میراث افغانستان` |
| `apps/web/src/app/(public)/categories/page.tsx` | توضیح | `مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.` |
| `apps/web/src/app/(auth)/login/page.tsx` | عنوان | `ورود به حساب \| میراث افغانستان` |
| `apps/web/src/app/(auth)/login/page.tsx` | توضیح | `ورود به حساب کاربری میراث افغانستان.` |
| `apps/web/src/app/(auth)/register/page.tsx` | عنوان | `ایجاد حساب کاربری \| میراث افغانستان` |
| `apps/web/src/app/(auth)/register/page.tsx` | توضیح | `ایجاد حساب کاربری در میراث افغانستان.` |

## Header

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/components/layout/public-header.tsx` | لوگو | `میراث افغانستان` |
| `apps/web/src/components/layout/public-header.tsx` | لینک ناوبری | `خانه` |
| `apps/web/src/components/layout/public-header.tsx` | لینک ناوبری | `مطالب` |
| `apps/web/src/components/layout/public-header.tsx` | لینک ناوبری | `ولایت‌ها` |
| `apps/web/src/components/layout/public-header.tsx` | لینک ناوبری | `دسته‌بندی‌ها` |
| `apps/web/src/components/layout/public-header.tsx` | جست‌وجوی دسکتاپ | `جست‌وجو در فرهنگ افغانستان...` |
| `apps/web/src/components/layout/public-header.tsx` | جست‌وجوی موبایل | `جست‌وجو...` |
| `apps/web/src/components/layout/public-header.tsx` | CTA کاربر واردشده | `افزودن مطلب` |
| `apps/web/src/components/layout/public-header.tsx` | Auth link | `ورود` |
| `apps/web/src/components/layout/public-header.tsx` | Auth link | `ثبت‌نام` |
| `apps/web/src/components/layout/public-header.tsx` | منوی موبایل، account | `حساب کاربری` |
| `apps/web/src/components/layout/public-header.tsx` | خروج | `خروج` |
| `apps/web/src/components/layout/public-header.tsx` | خروج pending | `در حال خروج...` |
| `apps/web/src/components/layout/public-header.tsx` | خطای خروج | `خروج انجام نشد. دوباره تلاش کنید.` |
| `apps/web/src/components/layout/public-header.tsx` | تأیید خروج، عنوان | `از حساب خارج می‌شوید؟` |
| `apps/web/src/components/layout/public-header.tsx` | تأیید خروج، توضیح | `هر وقت خواستید می‌توانید دوباره وارد شوید.` |
| `apps/web/src/components/layout/public-header.tsx` | تأیید خروج، cancel | `انصراف` |
| `apps/web/src/components/layout/public-header.tsx` | تأیید خروج، action | `خروج از حساب` |

## Footer

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/home/components/home-footer.tsx` | برند | `میراث افغانستان` |
| `apps/web/src/features/home/components/home-footer.tsx` | زیرعنوان برند | `فرهنگ، تاریخ، هویت ما` |
| `apps/web/src/features/home/components/home-footer.tsx` | توضیح برند | `جایی برای گردآوری و شناخت فرهنگ افغانستان` |
| `apps/web/src/features/home/components/home-footer.tsx` | گروه لینک | `دسترسی سریع` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `موضوع‌ها` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `ولایت‌ها` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `مطالب` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `درباره ما` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `تماس با ما` |
| `apps/web/src/features/home/components/home-footer.tsx` | گروه لینک | `منابع` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `راهنما` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `سؤالات متداول` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `شرایط استفاده` |
| `apps/web/src/features/home/components/home-footer.tsx` | لینک | `حریم خصوصی` |
| `apps/web/src/features/home/components/home-footer.tsx` | شبکه اجتماعی | `اینستاگرام` |
| `apps/web/src/features/home/components/home-footer.tsx` | شبکه اجتماعی | `فیسبوک` |
| `apps/web/src/features/home/components/home-footer.tsx` | شبکه اجتماعی | `ایکس` |
| `apps/web/src/features/home/components/home-footer.tsx` | شبکه اجتماعی | `یوتیوب` |
| `apps/web/src/features/home/components/home-footer.tsx` | خبرنامه title | `تازه‌های میراث افغانستان` |
| `apps/web/src/features/home/components/home-footer.tsx` | خبرنامه description | `تازه‌ترین نوشته‌ها را در ایمیل خود دریافت کنید.` |
| `apps/web/src/features/home/components/home-footer.tsx` | input | `ایمیل شما` |
| `apps/web/src/features/home/components/home-footer.tsx` | button | `عضویت` |
| `apps/web/src/features/home/components/home-footer.tsx` | copyright | `© {سال} میراث افغانستان. تمام حقوق محفوظ است.` |

## صفحه اصلی

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/home/components/home-hero.tsx` | برند | `میراث افغانستان` |
| `apps/web/src/features/home/components/home-hero.tsx` | headline | `فرهنگ افغانستان را از دل روایت‌ها ببینید` |
| `apps/web/src/features/home/components/home-hero.tsx` | supporting text | `جایی برای خواندن، ثبت و شناخت میراث فرهنگی افغانستان؛ از بناهای تاریخی و آیین‌ها تا چهره‌ها و دانش محلی.` |
| `apps/web/src/features/home/components/home-hero.tsx` | CTA اصلی | `دیدن مطالب` |
| `apps/web/src/features/home/components/home-hero.tsx` | CTA دوم | `افزودن مطلب` |
| `apps/web/src/features/home/components/home-content.tsx` | eyebrow | `فرهنگ افغانستان` |
| `apps/web/src/features/home/components/home-content.tsx` | title | `تازه‌ترین نوشته‌های فرهنگی از گوشه‌وکنار افغانستان` |
| `apps/web/src/features/home/components/home-content.tsx` | description | `تازه‌ترین مطالب منتشرشده را اینجا ببینید.` |
| `apps/web/src/features/home/components/home-content.tsx` | آمار | `مطلب منتشرشده` |
| `apps/web/src/features/home/components/home-content.tsx` | آمار | `ولایت` |
| `apps/web/src/features/home/components/home-content.tsx` | آمار | `دسته‌بندی` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش ولایت title | `فرهنگ افغانستان بر اساس ولایت` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش ولایت description | `فرهنگ افغانستان را ولایت به ولایت ببینید.` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش تازه‌ها eyebrow | `تازه‌ها` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش تازه‌ها title | `تازه‌ترین نوشته‌ها` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش تازه‌ها description | `نگاهی به تازه‌ترین مطالب سایت` |
| `apps/web/src/features/home/components/home-content.tsx` | لینک | `دیدن همه` |
| `apps/web/src/features/home/components/home-content.tsx` | دسته‌بندی title | `دسته‌بندی‌های فرهنگی` |
| `apps/web/src/features/home/components/home-content.tsx` | دسته‌بندی description | `از ادبیات و شخصیت‌ها تا بناهای تاریخی و آیین‌ها، مطالب را بر اساس موضوع دنبال کنید.` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش ملی title | `فرهنگ مشترک افغانستان` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش ملی description | `بعضی از رسم‌ها، چهره‌ها و روایت‌ها در بخش‌های مختلف افغانستان شناخته شده‌اند.` |
| `apps/web/src/features/home/components/home-content.tsx` | بخش ملی CTA | `دیدن مطالب سراسری` |
| `apps/web/src/features/home/components/home-content.tsx` | fallback title | `موضوع‌های پیشنهادی` |
| `apps/web/src/features/home/components/home-content.tsx` | مشارکت eyebrow | `مشارکت فرهنگی` |
| `apps/web/src/features/home/components/home-content.tsx` | مشارکت title | `اگر چیزی از فرهنگ و تاریخ محل‌تان می‌دانید، با دیگران شریک کنید.` |
| `apps/web/src/features/home/components/home-content.tsx` | مشارکت description | `مطالب پس از ثبت و بررسی، در سایت منتشر می‌شوند.` |
| `apps/web/src/features/home/components/home-content.tsx` | مشارکت CTA | `افزودن مطلب` |
| `apps/web/src/features/home/components/home-content.tsx` | مشارکت link | `درباره میراث افغانستان` |

## Explore / مطالب

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/entries/components/explore-content.tsx` | برگشت | `بازگشت به خانه` |
| `apps/web/src/features/entries/components/explore-content.tsx` | eyebrow | `مطالب فرهنگی` |
| `apps/web/src/features/entries/components/explore-content.tsx` | title | `فرهنگ افغانستان` |
| `apps/web/src/features/entries/components/explore-content.tsx` | description | `مطالب را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.` |
| `apps/web/src/features/entries/components/explore-content.tsx` | نتیجه | `{عدد} مطلب` |
| `apps/web/src/features/entries/components/explore-content.tsx` | فیلتر title | `فیلترها` |
| `apps/web/src/features/entries/components/explore-content.tsx` | فیلتر description | `موضوع، ولایت و نوع محتوا را انتخاب کنید.` |
| `apps/web/src/features/entries/components/explore-content.tsx` | select | `ترتیب نمایش` |
| `apps/web/src/features/entries/components/explore-content.tsx` | sort | `تازه‌ترین` |
| `apps/web/src/features/entries/components/explore-content.tsx` | sort | `قدیمی‌ترین` |
| `apps/web/src/features/entries/components/explore-content.tsx` | sort | `آخرین ویرایش` |
| `apps/web/src/features/entries/components/explore-content.tsx` | select | `محدوده جغرافیایی` |
| `apps/web/src/features/entries/components/explore-content.tsx` | option | `وابسته به یک ولایت` |
| `apps/web/src/features/entries/components/explore-content.tsx` | option | `سراسر افغانستان` |
| `apps/web/src/features/entries/components/explore-content.tsx` | option | `بدون وابستگی به مکان` |
| `apps/web/src/features/entries/components/explore-content.tsx` | select | `ولایت` |
| `apps/web/src/features/entries/components/explore-content.tsx` | select | `دسته‌بندی` |
| `apps/web/src/features/entries/components/explore-content.tsx` | select | `نوع محتوا` |
| `apps/web/src/features/entries/components/explore-content.tsx` | select | `برچسب` |
| `apps/web/src/features/entries/components/explore-content.tsx` | button | `نمایش نتایج` |
| `apps/web/src/features/entries/components/explore-content.tsx` | button | `حذف همه فیلترها` |
| `apps/web/src/features/entries/components/explore-content.tsx` | badge | `{عدد} فیلتر فعال` |
| `apps/web/src/features/entries/components/explore-content.tsx` | empty title | `نتیجه‌ای پیدا نشد` |
| `apps/web/src/features/entries/components/explore-content.tsx` | empty description | `با این فیلترها چیزی پیدا نشد. فیلترها را تغییر دهید.` |
| `apps/web/src/features/entries/components/explore-content.tsx` | empty action | `نمایش همه مطالب` |
| `apps/web/src/features/entries/components/explore-content.tsx` | API notice | `فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.` |

## ولایت‌ها

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | index eyebrow | `ولایت‌ها` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | index title | `فرهنگ افغانستان بر اساس ولایت` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | index subtitle | `با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty title | `هنوز ولایتی برای نمایش در دسترس نیست.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty description | `پس از آماده شدن داده‌های عمومی، ولایت‌ها در این صفحه نمایش داده می‌شوند.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty action | `دیدن مطالب` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | breadcrumb | `خانه / ولایت‌ها / {نام ولایت}` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | badge | `وابسته به یک ولایت` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | detail description | `نوشته‌ها و روایت‌های مربوط به {نام ولایت} را ببینید.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | stat | `مطلب` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | stat | `دسته‌بندی فعال` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | section title | `فرهنگ و میراث {نام ولایت}` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | chip | `همه` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | province card count | `{عدد} مطلب` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | province card text | `دیدن میراث ولایت {نام ولایت}` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty province title | `هنوز مطلبی برای این ولایت منتشر نشده است.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty province description | `هنوز مطلبی در این بخش منتشر نشده است.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty action | `افزودن مطلب` |

## دسته‌بندی‌ها

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | index eyebrow | `دسته‌بندی‌ها` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | index title | `کاوش بر اساس موضوع` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | index subtitle | `مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty title | `هنوز دسته‌بندی‌ای برای نمایش در دسترس نیست.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty description | `پس از آماده شدن داده‌های عمومی، دسته‌بندی‌ها در این صفحه نمایش داده می‌شوند.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty action | `دیدن مطالب` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | breadcrumb | `خانه / دسته‌بندی‌ها / {نام دسته‌بندی}` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | badge | `موضوع فرهنگی` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | count | `{عدد} مطلب منتشرشده` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | detail note | `مطالب این موضوع از سراسر افغانستان` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | filter title | `بر اساس ولایت` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | filter description | `«سراسری» یعنی این مطلب به ولایت خاصی وابسته نیست.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | chip | `همه افغانستان` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | chip | `سراسری` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | category card count | `{عدد} مطلب` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty category title | `هنوز مطلبی در این بخش منتشر نشده است.` |
| `apps/web/src/features/entries/components/taxonomy-discovery-pages.tsx` | empty action | `افزودن مطلب` |

### توضیح‌های دسته‌بندی

| slug | متن |
| --- | --- |
| `historical-places` | `بناها، شهرها، آرامگاه‌ها و دیگر مکان‌های تاریخی افغانستان.` |
| `traditions-and-customs` | `رسم‌ها، آیین‌ها و شیوه‌های زندگی در بخش‌های مختلف افغانستان.` |
| `food` | `خوراک‌های محلی، شیوه‌های پخت و رسم‌های مربوط به غذا و سفره.` |
| `clothing` | `پوشاک محلی، شیوه‌های دوخت و هنرهای وابسته به لباس.` |
| `handicrafts` | `هنرها و مهارت‌های دستی رایج در بخش‌های مختلف افغانستان.` |
| `music` | `سازها، آوازها و موسیقی محلی و شهری افغانستان.` |
| `poetry-and-literature` | `شاعران، نویسندگان، آثار ادبی و ادبیات زبان‌های مختلف افغانستان.` |
| `oral-stories` | `قصه‌ها، خاطره‌ها و روایت‌هایی که سینه‌به‌سینه نقل شده‌اند.` |
| `festivals-and-ceremonies` | `جشن‌ها، مراسم و آیین‌های جمعی در بخش‌های مختلف افغانستان.` |
| `languages-and-expressions` | `زبان‌ها، گویش‌ها، اصطلاحات و تعبیرهای رایج در مناطق مختلف افغانستان.` |
| `architecture` | `سبک‌های معماری، شیوه‌های ساخت و جزئیات بناهای بومی و تاریخی.` |
| `cultural-objects` | `اشیا و ابزارهایی که در زندگی و فرهنگ مردم کاربرد یا معنای ویژه دارند.` |
| `local-games` | `بازی‌ها و سرگرمی‌های محلی در مناطق مختلف افغانستان.` |
| `traditional-occupations` | `پیشه‌ها و مهارت‌های سنتی که بخشی از زندگی و اقتصاد محلی بوده‌اند.` |
| fallback | `مطالب فرهنگی مرتبط با {نام دسته‌بندی}.` |

## جزئیات مطلب

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | برگشت | `بازگشت به مطالب` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | metadata label | `نویسنده` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | metadata label | `تاریخ انتشار` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | metadata label | `موقعیت` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | empty body | `متن کامل این مطلب هنوز برای نمایش آماده نیست.` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | more images | `تصاویر بیشتر` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | video | `ویدیوی مرتبط` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | sources | `منابع` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | fallback source | `منبع بدون عنوان` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy card | `جزئیات مطلب` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy label | `گستره` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy label | `ولایت` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy label | `ولسوالی` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy label | `موقعیت` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy label | `دسته‌بندی` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | taxonomy label | `نوع محتوا` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | tags card | `برچسب‌ها` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | references | `پیوندهای درون‌متنی` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | related | `مطالب مرتبط` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | comments title | `دیدگاه‌های خوانندگان` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | comments count | `{عدد} دیدگاه` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | comments empty | `هنوز دیدگاهی برای این مطلب ثبت نشده است. اگر این مطلب برایتان مفید بود، نخستین دیدگاه را بنویسید.` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | location label | `سراسر افغانستان` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | location label | `بدون وابستگی به مکان` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | location fallback | `وابسته به یک ولایت` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `کتاب` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `مقاله` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `وب‌سایت` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `مصاحبه` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `روایت شفاهی` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `تجربه شخصی` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source type | `دیگر` |
| `apps/web/src/features/entries/components/entry-detail-content.tsx` | source fallback | `منبع` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | action | `رفتن به دیدگاه‌ها` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | action | `رفتن به امتیازدهی` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | action | `ذخیره مطلب` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | toast | `ذخیره مطلب در گام بعدی به حساب کاربری وصل می‌شود.` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | action | `اشتراک‌گذاری` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | progress | `پیشرفت مطالعه` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | toast | `پیوند مطلب کپی شد.` |
| `apps/web/src/features/entries/components/entry-action-rail.tsx` | toast error | `کپی کردن پیوند انجام نشد.` |
| `apps/web/src/features/entries/components/entry-table-of-contents.tsx` | title | `فهرست مطالب` |

## دیدگاه و امتیازدهی

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/entries/components/reviews/entry-feedback.tsx` | توضیح امتیاز | `امتیازها میزان مفید بودن محتوا را نشان می‌دهند و دیدگاه‌ها جایگزین اصلاح رسمی اطلاعات نیستند.` |
| `apps/web/src/features/entries/components/reviews/entry-feedback.tsx` | نیاز به ورود | `برای ثبت دیدگاه باید وارد شوید و ایمیل خود را تأیید کنید.` |

## Auth Pages

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/auth/components/auth-brand-panel.tsx` | login brand title | `فرهنگ افغانستان، یک‌جا` |
| `apps/web/src/features/auth/components/auth-brand-panel.tsx` | login brand text | `فرهنگ و روایت‌های افغانستان را با هم ثبت می‌کنیم.` |
| `apps/web/src/app/(auth)/login/page.tsx` | card title | `خوش آمدید` |
| `apps/web/src/app/(auth)/login/page.tsx` | card description | `برای ادامه، وارد حساب خود شوید.` |
| `apps/web/src/features/auth/components/login-form.tsx` | label | `ایمیل` |
| `apps/web/src/features/auth/components/login-form.tsx` | label | `رمز عبور` |
| `apps/web/src/features/auth/components/login-form.tsx` | checkbox | `مرا به خاطر بسپار` |
| `apps/web/src/features/auth/components/login-form.tsx` | link | `رمز عبور را فراموش کرده‌اید؟` |
| `apps/web/src/features/auth/components/login-form.tsx` | button | `ورود` |
| `apps/web/src/features/auth/components/login-form.tsx` | pending | `در حال ورود` |
| `apps/web/src/features/auth/components/login-form.tsx` | divider | `یا با حساب خود ادامه دهید` |
| `apps/web/src/features/auth/components/login-form.tsx` | OAuth | `ورود با گوگل` |
| `apps/web/src/features/auth/components/login-form.tsx` | OAuth | `ورود با فیسبوک` |
| `apps/web/src/features/auth/components/login-form.tsx` | bottom text | `حساب کاربری ندارید؟` |
| `apps/web/src/features/auth/components/login-form.tsx` | bottom link | `ثبت‌نام کنید` |
| `apps/web/src/app/(auth)/register/page.tsx` | card title | `ایجاد حساب کاربری` |
| `apps/web/src/app/(auth)/register/page.tsx` | card description | `حساب بسازید و در گردآوری فرهنگ افغانستان سهم بگیرید.` |
| `apps/web/src/features/auth/components/register-form.tsx` | label | `نام و نام خانوادگی` |
| `apps/web/src/features/auth/components/register-form.tsx` | placeholder | `نام و نام خانوادگی خود را وارد کنید` |
| `apps/web/src/features/auth/components/register-form.tsx` | label | `ایمیل` |
| `apps/web/src/features/auth/components/register-form.tsx` | label | `رمز عبور` |
| `apps/web/src/features/auth/components/register-form.tsx` | placeholder | `رمز عبور خود را وارد کنید` |
| `apps/web/src/features/auth/components/register-form.tsx` | label | `تکرار رمز عبور` |
| `apps/web/src/features/auth/components/register-form.tsx` | placeholder | `رمز عبور را دوباره وارد کنید` |
| `apps/web/src/features/auth/components/register-form.tsx` | terms | `من با شرایط استفاده و سیاست حریم خصوصی موافقم.` |
| `apps/web/src/features/auth/components/register-form.tsx` | button | `ثبت‌نام` |
| `apps/web/src/features/auth/components/register-form.tsx` | pending | `در حال ثبت‌نام` |
| `apps/web/src/features/auth/components/register-form.tsx` | divider | `یا با حساب خود ادامه دهید` |
| `apps/web/src/features/auth/components/register-form.tsx` | OAuth | `ثبت‌نام با گوگل` |
| `apps/web/src/features/auth/components/register-form.tsx` | OAuth | `ثبت‌نام با فیسبوک` |
| `apps/web/src/features/auth/components/register-form.tsx` | bottom text | `قبلاً حساب کاربری دارید؟` |
| `apps/web/src/features/auth/components/register-form.tsx` | bottom link | `ورود به حساب` |
| `apps/web/src/features/auth/components/password-field.tsx` | a11y | `نمایش رمز عبور` |
| `apps/web/src/features/auth/components/password-field.tsx` | a11y | `پنهان کردن رمز عبور` |

## Auth State, Guards, And Navigation

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/auth/components/auth-navigation.tsx` | unverified badge | `ایمیل تأیید نشده` |
| `apps/web/src/features/auth/components/auth-navigation.tsx` | content management | `مدیریت محتوا` |
| `apps/web/src/features/auth/components/logout-all-button.tsx` | button | `خروج از همه دستگاه‌ها` |
| `apps/web/src/features/auth/components/unverified-email-notice.tsx` | notice | `ایمیل شما هنوز تأیید نشده است. ورود انجام شد، اما برای برخی کارهای مشارکتی مانند ثبت محتوا، باید ایمیل خود را تأیید کنید.` |
| `apps/web/src/features/auth/components/verified-email-banner.tsx` | notice | `ورود به حساب مجاز است، اما برای مشارکت‌هایی مانند ثبت محتوا، گزارش، امتیازدهی و نظر عمومی باید ایمیل خود را تأیید کنید.` |
| `apps/web/src/features/auth/components/forbidden-state.tsx` | forbidden | `حساب شما اجازه دسترسی به این بخش را ندارد.` |
| `apps/web/src/features/auth/components/auth-loading-state.tsx` | loading | `در حال بررسی وضعیت ورود...` |

## Auth Error Messages

| مسیر | code | متن |
| --- | --- | --- |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_INVALID_CREDENTIALS` | `اطلاعات ورود نادرست است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_PASSWORD_NOT_CONFIGURED` | `برای این حساب رمز عبور تنظیم نشده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_ACCOUNT_SUSPENDED` | `این حساب موقتاً تعلیق شده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_UNAUTHORIZED` | `برای ادامه باید وارد حساب شوید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_INSUFFICIENT_ROLE` | `حساب شما اجازه دسترسی به این بخش را ندارد.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_EMAIL_VERIFICATION_REQUIRED` | `برای این کار باید ایمیل خود را تأیید کنید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_EMAIL_ALREADY_REGISTERED` | `این ایمیل قبلاً ثبت شده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_PASSWORD_TOO_WEAK` | `رمز عبور شرایط امنیتی لازم را ندارد.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_GOOGLE_EMAIL_NOT_VERIFIED` | `ایمیل حساب گوگل شما تأیید نشده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED` | `این حساب گوگل قبلاً به حساب دیگری وصل شده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_GOOGLE_AUTH_FAILED` | `ورود با گوگل کامل نشد. دوباره تلاش کنید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_FACEBOOK_EMAIL_REQUIRED` | `فیسبوک ایمیل حساب شما را در اختیار ما قرار نداد.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_FACEBOOK_EMAIL_LINKING_NOT_ALLOWED` | `این ایمیل قبلاً با روش دیگری ثبت شده و فیسبوک امکان اتصال امن آن را تأیید نکرده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_FACEBOOK_ACCOUNT_ALREADY_LINKED` | `این حساب فیسبوک قبلاً به حساب دیگری وصل شده است.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_FACEBOOK_AUTH_FAILED` | `ورود با فیسبوک کامل نشد. دوباره تلاش کنید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_OAUTH_FAILED` | `ورود اجتماعی کامل نشد. دوباره تلاش کنید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_REFRESH_TOKEN_MISSING` | `نشست ورود شما پیدا نشد. دوباره وارد شوید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_REFRESH_TOKEN_INVALID` | `نشست ورود معتبر نیست. دوباره وارد شوید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_REFRESH_TOKEN_EXPIRED` | `نشست ورود شما منقضی شده است. دوباره وارد شوید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_REFRESH_TOKEN_REVOKED` | `نشست ورود شما پایان یافته است. دوباره وارد شوید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `AUTH_SESSION_NOT_FOUND` | `نشست ورود شما پیدا نشد. دوباره وارد شوید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `OAUTH_CANCELLED` | `ورود لغو شد.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `BAD_REQUEST` | `لطفاً اطلاعات واردشده را بررسی کنید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `TOO_MANY_REQUESTS` | `تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | `NETWORK_ERROR` | `ارتباط با سرور برقرار نشد.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | fallback | `خطایی رخ داد.` |
| `apps/web/src/features/auth/utils/auth-error-messages.ts` | fallback with no request ID | `خطایی رخ داد. کمی بعد دوباره تلاش کنید.` |

## Validation Messages

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | password rule | `رمز عبور باید ۱۰ تا ۱۲۸ نویسه باشد و حداقل یک حرف کوچک، یک حرف بزرگ و یک عدد داشته باشد.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | login email | `ایمیل معتبر وارد کنید.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | login password | `رمز عبور را وارد کنید.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | name min | `نام و نام خانوادگی باید حداقل ۲ نویسه باشد.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | name max | `نام و نام خانوادگی نمی‌تواند بیشتر از ۸۰ نویسه باشد.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | confirm password | `تکرار رمز عبور را وارد کنید.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | terms | `پذیرش شرایط استفاده و سیاست حریم خصوصی الزامی است.` |
| `apps/web/src/features/auth/schemas/auth-schemas.ts` | password mismatch | `رمز عبور و تکرار آن یکسان نیستند.` |
| `apps/web/src/lib/validation/example-schema.ts` | demo name | `نام باید حداقل دو حرف باشد.` |
| `apps/web/src/lib/validation/example-schema.ts` | demo email | `ایمیل معتبر وارد کنید.` |

## Loading And Error States

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/app/(public)/error.tsx` | title | `بارگذاری این صفحه انجام نشد` |
| `apps/web/src/app/(public)/error.tsx` | action | `بازگشت به خانه` |
| `apps/web/src/app/(public)/explore/loading.tsx` | aria label | `در حال بارگذاری محتوا` |
| `apps/web/src/app/(public)/entries/[slug]/loading.tsx` | aria label | `در حال بارگذاری مطلب` |
| `apps/web/src/app/(public)/provinces/loading.tsx` | aria label | `در حال بارگذاری ولایت‌ها` |
| `apps/web/src/app/(public)/provinces/[slug]/loading.tsx` | aria label | `در حال بارگذاری جزئیات ولایت` |
| `apps/web/src/app/(public)/categories/[slug]/loading.tsx` | aria label | `در حال بارگذاری جزئیات دسته‌بندی` |
| `apps/web/src/app/(public)/entries/[slug]/page.tsx` | not found title | `مطلب پیدا نشد \| میراث افغانستان` |
| `apps/web/src/app/(public)/provinces/[slug]/page.tsx` | not found title | `ولایت پیدا نشد \| میراث افغانستان` |
| `apps/web/src/app/(public)/categories/[slug]/page.tsx` | not found title | `دسته‌بندی پیدا نشد \| میراث افغانستان` |

## Design Preview / Temporary Components

این متن‌ها مربوط به کامپوننت‌های نمونه یا preview هستند و احتمالاً قبل از production باید حذف یا بازنویسی شوند.

| مسیر | محل | متن |
| --- | --- | --- |
| `apps/web/src/components/common/example-form-preview.tsx` | toast | `فرم نمونه با موفقیت بررسی شد.` |
| `apps/web/src/components/common/example-form-preview.tsx` | toast description | `{نام}، هیچ درخواستی به سرور ارسال نشد.` |
| `apps/web/src/components/common/example-form-preview.tsx` | label | `نام` |
| `apps/web/src/components/common/example-form-preview.tsx` | placeholder | `نام شما` |
| `apps/web/src/components/common/example-form-preview.tsx` | label | `ایمیل` |
| `apps/web/src/components/common/example-form-preview.tsx` | button | `بررسی فرم` |
| `apps/web/src/components/common/example-form-preview.tsx` | success | `اعتبارسنجی نمونه موفق بود.` |
| `apps/web/src/components/common/rich-text-preview.tsx` | editor sample | `این یک متن نمونه برای بررسی ویرایشگر فارسی راست‌به‌چپ است.` |
| `apps/web/src/components/common/ui-state-preview.tsx` | state | `منوی موبایل: باز/بسته` |
| `apps/web/src/components/common/ui-state-preview.tsx` | state | `نوار کناری: باز/بسته` |
| `apps/web/src/components/common/ui-state-preview.tsx` | button | `تغییر منوی موبایل` |
| `apps/web/src/components/common/ui-state-preview.tsx` | button | `تغییر نوار کناری` |
| `apps/web/src/components/common/theme-toggle.tsx` | aria | `تغییر به حالت روشن` |
| `apps/web/src/components/common/theme-toggle.tsx` | aria | `تغییر به حالت تاریک` |
| `apps/web/src/components/common/theme-toggle.tsx` | label | `روشن` |
| `apps/web/src/components/common/theme-toggle.tsx` | label | `تاریک` |

## Notes For Review

- اگر متنی عمومی است و به یک آیتم منتشرشده اشاره دارد، بهتر است `مطلب` بماند.
- اگر متنی به سیستم، فیلتر فنی، نوع محتوا، یا مدیریت اشاره دارد، `محتوا` قابل قبول است.
- `مقاله` فعلاً فقط در نوع منبع `ARTICLE` باقی مانده و معنای دقیق خودش را دارد.
- `کاوش بر اساس موضوع` تنها استفاده‌ی باقی‌مانده از `کاوش` در UI اصلی است. اگر بخواهیم کاملاً عملی‌ترش کنیم، گزینه‌ی پیشنهادی: `بر اساس موضوع ببینید`.
