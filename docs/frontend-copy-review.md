I reviewed the entire copy file, not just the earlier lines, and compared its tone with current Persian content interfaces such as **طاقچه، گنجور، کتابراه، دیجی‌کالا** and Afghan Persian editorial sites such as **اطلاعات روز، طلوع‌نیوز و افغانستان اینترنشنال**. A useful pattern is that the strongest interfaces use short, concrete labels such as «تازه‌ترین مطالب»، «مشاهده همه»، «جست‌وجو»، «ورود و ثبت‌نام» and avoid explaining backend/system behavior to the reader. ([طاقچه][1])

## Implementation status

Status: implemented in the frontend UI.

Updated areas:

- Header search, mobile menu, logout confirmation, and public navigation wording.
- Footer newsletter and copyright wording.
- Homepage section labels, topic wording, and contribution links.
- Explore filters, sorting, geographic-scope labels, buttons, count text, and API-unavailable message.
- Province and topic pages, including empty states, badges, breadcrumbs, metadata, loading labels, and category descriptions.
- Cultural Entry detail page labels, empty states, internal-reference heading, action rail labels, bookmark placeholder, share error, review guidance, and taxonomy labels.
- Authentication form copy, OAuth divider copy, terms copy, validation messages, forbidden state, unverified-email notices, and normalized auth error messages.

Remaining by design:

- Code, API, and database names such as `Category`, `CulturalEntry`, and `contentType` remain unchanged.
- Admin or technical contexts may still use `محتوا` or `دسته‌بندی` where those words describe management concepts rather than public reading UI.
- `مقاله` remains where it is a real source type, such as `ARTICLE`.

Your copy is **much better now**. I would not rewrite everything again. Most of it already reads naturally. The remaining problems fall mainly into four groups: technical language leaking into public UI, a few overly polished sentences, unnecessary explanations, and some inconsistent terminology. Your current vocabulary rules are already a good foundation.

## Changes I would still make

| Current                                                                                                                                 | Recommended                                                                                          | Why                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `جست‌وجوی فرهنگ، مکان، روایت...`                                                                              | **`جست‌وجو در فرهنگ افغانستان...`**                                   | More natural as a search placeholder. Ganjoor similarly uses the simple construction «جستجو در شعر فارسی». ([Ganjoor][2])             |
| `راهی ساده برای دیدن فرهنگ افغانستان`                                                                   | **remove it**                                                                                  | Mobile menus normally do not need marketing copy.                                                                                                      |
| `از حساب خارج شوید؟`                                                                                                   | **`از حساب خارج می‌شوید؟`**                                                | Sounds more like natural confirmation dialogue.                                                                                                        |
| `نشست فعلی شما پایان می‌یابد. هر زمان خواستید می‌توانید دوباره وارد شوید.` | **`هر وقت خواستید می‌توانید دوباره وارد شوید.`**          | `نشست فعلی` is technical language.                                                                                                           |
| `در خبرنامه ما عضو شوید`                                                                                            | **`تازه‌های میراث افغانستان`**                                         | Less template-like.                                                                                                                                    |
| `تازه‌ترین نوشته‌ها را از دست ندهید.`                                                                    | **`تازه‌ترین نوشته‌ها را در ایمیل خود دریافت کنید.`** | Explains what the newsletter actually does. Afghan news sites also use direct wording around receiving material by email. ([اطلاعات روز][3]) |
| `تمامی حقوق محفوظ است.`                                                                                              | **`تمام حقوق محفوظ است.`**                                                   | Simpler.                                                                                                                                               |
| `تازه‌های ویرایش‌شده`                                                                                               | **`تازه‌ها`**                                                                         | Current wording sounds like CMS terminology.                                                                                                           |
| `موضوع‌های آماده برای دیدن`                                                                                     | **`موضوع‌های پیشنهادی`**                                                    | Much more natural.                                                                                                                                     |
| `درباره این پلتفرم`                                                                                                    | **`درباره میراث افغانستان`**                                             | `پلتفرم` breaks the cultural/editorial tone.                                                                                                   |

These affect the header/footer/home copy around the sections shown in your review file.

### Explore

The Explore page is already substantially better. I would make only these changes:

| Current                                                                                                                     | Recommended                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `{عدد} مطلب پیدا شد.`                                                                                        | **`{عدد} مطلب`**                                                                                           |
| `به‌روزترین`                                                                                                    | **`آخرین ویرایش`**                                                                                     |
| `گستره جغرافیایی`                                                                                           | **`محدوده جغرافیایی`**                                                                             |
| `ولایت مشخص`                                                                                                     | **`وابسته به یک ولایت`**                                                                           |
| `بدون وابستگی جغرافیایی`                                                                              | **`بدون وابستگی به مکان`**                                                                       |
| `اعمال فیلتر`                                                                                                   | **`نمایش نتایج`**                                                                                       |
| `پاک کردن فیلترها`                                                                                          | **`حذف همه فیلترها`**                                                                                |
| `بخشی از داده‌های عمومی در دسترس نیست. لطفاً وضعیت API را بررسی کنید.` | **`فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.`** |

The last one is especially important. **A normal visitor should never see the word API.** That is a developer-facing diagnostic, not interface copy.

Your Explore copy is here.

I also like **`نمایش نتایج`** better than `اعمال فیلتر`, because mature Persian sites generally frame actions around what the user is trying to accomplish rather than the implementation operation. Digikala, for example, uses direct constructions such as searching for a desired item or selecting a topic/category. ([Digikala][4])

---

# Province pages

There are several remaining pieces of system-like copy.

### Province index

Current:

> `هنوز ولایتی برای نمایش در دسترس نیست.`

and:

> `پس از آماده شدن داده‌های عمومی، ولایت‌ها در این صفحه نمایش داده می‌شوند.`

I would **not show either**.

If provinces fail to load, that is an error rather than a meaningful empty state:

**Title**

> `نمایش ولایت‌ها ممکن نشد`

**Description**

> `کمی بعد دوباره تلاش کنید.`

All Afghanistan provinces should normally exist in your taxonomy, so saying "there are no provinces yet" makes the product sound unfinished.

### Province detail

Change:

`ولایت مشخص` → **remove the badge entirely** or simply `ولایت`

`نوشته‌ها و روایت‌های مربوط به {ولایت} را ببینید.` → **`مطالب مربوط به {ولایت} را ببینید.`**

The original is not wrong, but not every Cultural Entry is a روایت.

Change the card CTA:

`دیدن میراث ولایت {نام}`

to:

**`دیدن مطالب`**

The province name is already visible on the card, so repeating it inside the CTA feels generated.

And your empty state currently repeats itself:

> هنوز مطلبی برای این ولایت منتشر نشده است.
> هنوز مطلبی در این بخش منتشر نشده است.

Instead:

**Title**

> `هنوز مطلبی برای این ولایت منتشر نشده است.`

**Description**

> `اگر درباره فرهنگ و تاریخ این ولایت چیزی می‌دانید، می‌توانید آن را ثبت کنید.`

**CTA**

> `افزودن مطلب`

That turns an empty state into a useful crowdsourcing opportunity without sounding like marketing.

---

# Category pages

Here I recommend one broader vocabulary change.

For **public UI**, I prefer:

**موضوع / موضوع‌ها**

For **technical/admin UI**, keep:

**دسته‌بندی**

Persian content websites commonly organize items «بر اساس موضوع» even when the underlying structure is technically a category. Taaghche itself uses both «دسته‌بندی» and the reader-oriented expression «براساس موضوع». ([طاقچه][5])

That means your header could eventually be:

`خانه | مطالب | ولایت‌ها | موضوع‌ها`

while your admin dashboard can continue saying:

`مدیریت دسته‌بندی‌ها`

### Specifically

Current:

> `کاوش بر اساس موضوع`

I would now change this final remaining `کاوش` to:

> **`مطالب بر اساس موضوع`**

Subtitle:

> `مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.`

can remain.

Change:

`موضوع فرهنگی` badge → **remove it** unless the badge has actual informational value.

`{عدد} مطلب منتشرشده` → **`{عدد} مطلب`**

`«سراسری» یعنی این مطلب به ولایت خاصی وابسته نیست.`

→

**`«سراسری» شامل مطالبی است که به ولایت خاصی وابسته نیستند.`**

More natural because the filter applies to a collection rather than one item.

---

# Category descriptions

This is probably the area that still sounds **most AI-written**.

For example:

> `بناها، شهرها، آرامگاه‌ها و مکان‌هایی که حافظه تاریخی افغانستان را زنده نگه می‌دارند.`

The phrase «حافظه تاریخی افغانستان را زنده نگه می‌دارند» is polished, but it sounds like generated cultural-project copy.

I would make all descriptions factual and plain:

| Category                | Recommended description                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Historical places       | **`بناها، شهرها، آرامگاه‌ها و دیگر مکان‌های تاریخی افغانستان.`**                   |
| Traditions and customs  | **`رسم‌ها، آیین‌ها و شیوه‌های زندگی در بخش‌های مختلف افغانستان.`**                |
| Food                    | **`خوراک‌های محلی، شیوه‌های پخت و رسم‌های مربوط به غذا و سفره.`**                    |
| Clothing                | **`پوشاک محلی، شیوه‌های دوخت و هنرهای وابسته به لباس.`**                                    |
| Handicrafts             | **`هنرها و مهارت‌های دستی رایج در بخش‌های مختلف افغانستان.`**                          |
| Music                   | **`سازها، آوازها و موسیقی محلی و شهری افغانستان.`**                                             |
| Poetry and literature   | **`شاعران، نویسندگان، آثار ادبی و ادبیات زبان‌های مختلف افغانستان.`**          |
| Oral stories            | **`قصه‌ها، خاطره‌ها و روایت‌هایی که سینه‌به‌سینه نقل شده‌اند.`**                   |
| Festivals               | **`جشن‌ها، مراسم و آیین‌های جمعی در بخش‌های مختلف افغانستان.`**                      |
| Languages               | **`زبان‌ها، گویش‌ها، اصطلاحات و تعبیرهای رایج در مناطق مختلف افغانستان.`** |
| Architecture            | **`سبک‌های معماری، شیوه‌های ساخت و جزئیات بناهای بومی و تاریخی.`**                 |
| Cultural objects        | **`اشیا و ابزارهایی که در زندگی و فرهنگ مردم کاربرد یا معنای ویژه دارند.`**   |
| Local games             | **`بازی‌ها و سرگرمی‌های محلی در مناطق مختلف افغانستان.`**                                 |
| Traditional occupations | **`پیشه‌ها و مهارت‌های سنتی که بخشی از زندگی و اقتصاد محلی بوده‌اند.`**         |

The original descriptions are at .

This simpler approach also matches sites such as Ganjoor and Taaghche better: their category/navigation text is usually descriptive rather than promotional. ([Ganjoor][6])

---

# Cultural Entry page

This section is generally good, but I found several things I would definitely change.

### 1. `گستره`

This is too abstract when standing alone.

Use:

**`محدوده جغرافیایی`**

### 2. `پیوندهای درون‌متنی`

This sounds like documentation for an editor.

Because these are your Wikipedia-style links to other Cultural Entries, use:

> **`مطالب اشاره‌شده در متن`**

Then keep:

> `مطالب مرتبط`

as the algorithmic/editorial related-content section.

This also creates a useful semantic distinction.

### 3. Empty content

Current:

> `متن کامل این مطلب هنوز برای نمایش آماده نیست.`

Use:

> **`متن این مطلب در دسترس نیست.`**

A published page should not talk about being "ready for display."

### 4. Comment empty state

Current:

> `هنوز دیدگاهی برای این مطلب ثبت نشده است. اگر این مطلب برایتان مفید بود، نخستین دیدگاه را بنویسید.`

Better:

> **`هنوز دیدگاهی نوشته نشده است. شما اولین نفر باشید.`**

Shorter and more human.

### 5. Action rail

Change:

`رفتن به دیدگاه‌ها` → **`دیدگاه‌ها`**

Buttons do not need to narrate navigation.

### 6. Bookmark placeholder

This is one of the most important ones to remove:

> `ذخیره مطلب در گام بعدی به حساب کاربری وصل می‌شود.`

That is development commentary.

Either implement it or temporarily remove/disable the action. If you absolutely need a message:

> **`این امکان هنوز فعال نشده است.`**

But removing unfinished public controls is preferable.

### 7. Copy failure

Current:

> `کپی کردن پیوند انجام نشد.`

Better:

> **`پیوند کپی نشد. دوباره تلاش کنید.`**

All of these appear in the detail-page copy.

---

# Reviews

This sentence is accurate but sounds like policy documentation:

> `دیدگاه‌ها جایگزین اصلاح رسمی اطلاعات نیستند.`

I recommend:

> **`دیدگاه‌ها برای نظر خوانندگان‌اند. برای اصلاح اطلاعات، از «پیشنهاد اصلاح» استفاده کنید.`**

That explains the distinction to the reader rather than stating a rule.

---

# Authentication

Most Auth copy is now good. I would **keep**:

* `خوش آمدید`
* `برای ادامه، وارد حساب خود شوید.`
* `حساب بسازید و در گردآوری فرهنگ افغانستان سهم بگیرید.`
* `ایمیل`
* `رمز عبور`
* `مرا به خاطر بسپار`
* `رمز عبور را فراموش کرده‌اید؟`
* `ورود با گوگل`
* `ورود با فیسبوک`
* `حساب کاربری ندارید؟`
* `ثبت‌نام کنید`

These are direct and familiar. Current Persian services similarly rely on simple «ورود» / «ثبت‌نام» terminology rather than creative alternatives. ([fidibo.com][7])

I would make only these changes:

`در حال ورود` → **`در حال ورود...`**

`در حال ثبت‌نام` → **`در حال ثبت‌نام...`**

And:

> `یا با حساب خود ادامه دهید`

→

> **`یا از یکی از این روش‌ها استفاده کنید`**

because Google/Facebook are *methods of authentication*, not necessarily "your account" in the way the sentence implies.

For Terms:

> `من با شرایط استفاده و سیاست حریم خصوصی موافقم.`

I prefer:

> **`شرایط استفاده و سیاست حفظ حریم خصوصی را می‌پذیرم.`**

---

# Auth-state messages

These still have several backend-like sentences.

### Unverified email

Current:

> `ایمیل شما هنوز تأیید نشده است. ورود انجام شد، اما برای برخی کارهای مشارکتی مانند ثبت محتوا، باید ایمیل خود را تأیید کنید.`

Replace with:

> **`ایمیل شما هنوز تأیید نشده است. برای افزودن مطلب و برخی فعالیت‌ها باید ایمیل خود را تأیید کنید.`**

No need to say «ورود انجام شد».

### The other verification banner

Current:

> `ورود به حساب مجاز است، اما برای مشارکت‌هایی مانند ثبت محتوا، گزارش و نظر عمومی باید ایمیل خود را تأیید کنید.`

This sounds like a terms-of-service document.

Use:

> **`می‌توانید وارد حساب شوید؛ اما برای افزودن مطلب، گزارش و نوشتن دیدگاه باید ایمیل خود را تأیید کنید.`**

### Forbidden

`حساب شما اجازه دسترسی به این بخش را ندارد.`

→

**`شما به این بخش دسترسی ندارید.`**

Much better.

---

# Authentication errors

This is another place where I would make substantial changes.

### Invalid credentials

`اطلاعات ورود نادرست است.`

→

**`ایمیل یا رمز عبور نادرست است.`**

More useful.

### Password not configured

`برای این حساب رمز عبور تنظیم نشده است.`

→

**`برای این حساب رمز عبور ندارید. از روش ورود قبلی خود استفاده کنید.`**

### Facebook linking

Current:

> `این ایمیل قبلاً با روش دیگری ثبت شده و فیسبوک امکان اتصال امن آن را تأیید نکرده است.`

Definitely too technical.

Use:

> **`این ایمیل قبلاً با روش دیگری ثبت شده است. لطفاً با همان روش وارد شوید.`**

### Generic OAuth

`ورود اجتماعی کامل نشد.`

Never use **«ورود اجتماعی»** publicly.

Use:

> **`ورود با این حساب کامل نشد. دوباره تلاش کنید.`**

---

## Remove `نشست ورود` completely from public Persian

You currently have:

* `نشست ورود شما پیدا نشد`
* `نشست ورود معتبر نیست`
* `نشست ورود شما منقضی شده است`
* `نشست ورود شما پایان یافته است`

These are translations of *session*, but humans normally do not think in terms of login sessions.

Map them to simple messages:

| Error             | Public message                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------- |
| missing           | **`برای ادامه دوباره وارد شوید.`**                            |
| invalid           | **`برای ادامه دوباره وارد شوید.`**                            |
| expired           | **`مدت ورود شما تمام شده است. دوباره وارد شوید.`** |
| revoked           | **`از حساب خارج شده‌اید. دوباره وارد شوید.`**         |
| session not found | **`برای ادامه دوباره وارد شوید.`**                            |

The backend can still keep distinct error codes.

That distinction—**precise technical codes internally, simple messages externally**—is exactly what you want.

Your current errors appear here.

---

# Validation messages

The main thing I would change is **`نویسه`**.

It is correct Persian, but it reads like formal technical localization.

Current:

> `رمز عبور باید ۱۰ تا ۱۲۸ نویسه باشد...`

Use:

> **`رمز عبور باید بین ۱۰ تا ۱۲۸ کاراکتر باشد و دست‌کم یک حرف کوچک انگلیسی، یک حرف بزرگ انگلیسی و یک عدد داشته باشد.`**

If the backend specifically requires Latin upper/lowercase characters, saying **انگلیسی** matters; otherwise a Persian-speaking user may reasonably wonder how uppercase Persian is supposed to work.

For names:

`حداقل ۲ نویسه` → **`حداقل ۲ حرف`**

`بیشتر از ۸۰ نویسه` → **`بیشتر از ۸۰ حرف`**

Terms validation:

`پذیرش شرایط استفاده و سیاست حریم خصوصی الزامی است.`

→

**`برای ثبت‌نام باید شرایط استفاده و سیاست حفظ حریم خصوصی را بپذیرید.`**

---

# Error/loading states

Current:

> `بارگذاری این صفحه انجام نشد`

→

> **`این صفحه بارگذاری نشد.`**

If there is room for another button, I would actually use:

**Title:** `این صفحه بارگذاری نشد`
**Primary action:** `تلاش دوباره`
**Secondary:** `بازگشت به خانه`

For ARIA:

`در حال بارگذاری جزئیات ولایت`

→ **`در حال بارگذاری صفحه ولایت`**

`در حال بارگذاری جزئیات دسته‌بندی`

→ **`در حال بارگذاری صفحه موضوع`**

The existing states are listed here.

---

# Three terminology decisions I would now lock

### 1. Public `Category` → **موضوع**

Not everywhere in code—only user-facing text.

So:

**Header:** `موضوع‌ها`
**Index:** `مطالب بر اساس موضوع`
**Filter:** `موضوع`
**Entry metadata:** `موضوع`

But:

**Admin:** `دسته‌بندی‌ها`
**Database/code:** `Category`

This is warmer while remaining clear. Persian book/content sites commonly expose content by subject while retaining category structures underneath. ([طاقچه][5])

### 2. `مطلب` remains your default CulturalEntry name

I strongly agree with the convention you established.

Use:

* `مطلب`
* `مطالب`
* `افزودن مطلب`
* `مطالب مرتبط`
* `۲۴ مطلب`

Use `نوشته` only for warmer editorial headings.

Use `روایت` only for genuinely narrative content.

### 3. Keep Afghan Persian where it matters

Do **not** make the site Iranian just because we looked at Iranian websites.

Keep:

* **ولایت**
* **ولسوالی**
* **فیسبوک**
* Afghanistan-specific geographic terminology
* local cultural vocabulary

Afghan Persian media naturally uses vocabulary specific to Afghanistan alongside broadly standard written Persian. ([TOLOnews][8])

The goal should be:

> **natural Persian understandable across the Persian-speaking world, with Afghan vocabulary where the subject requires it.**

---

## What I would *not* change

A lot of your current copy should now stay exactly as it is. For example:

> `فرهنگ افغانستان را ولایت به ولایت ببینید.`

> `فرهنگ مشترک افغانستان`

> `اگر چیزی از فرهنگ و تاریخ محل‌تان می‌دانید، با دیگران شریک کنید.`

> `مطالب را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.`

> `با این فیلترها چیزی پیدا نشد. فیلترها را تغییر دهید.`

> `برای ادامه، وارد حساب خود شوید.`

> `حساب بسازید و در گردآوری فرهنگ افغانستان سهم بگیرید.`

Those already sound substantially more human than the original version.

My overall target for **میراث افغانستان** would now be:

**clear, calm, educated Afghan Persian — not literary, not bureaucratic, not NGO-like, and not software documentation.**

The biggest remaining cleanup is not the homepage anymore; it is **category descriptions, auth/session errors, empty states, and a few developer-facing strings leaking into the public UI.**

[1]: https://taaghche.com/category/%DA%A9%D8%AA%D8%A7%D8%A8-%D8%B1%D8%A7%DB%8C%DA%AF%D8%A7%D9%86?utm_source=chatgpt.com
[2]: https://ganjoor.net/?utm_source=chatgpt.com
[3]: https://www.etilaatroz.com/category/news/page/1674/?utm_source=chatgpt.com
[4]: https://www.digikala.com/faq/?utm_source=chatgpt.com
[5]: https://taaghche.com/categories?utm_source=chatgpt.com
[6]: https://ganjoor.net/bidel/ghazalbi?utm_source=chatgpt.com
[7]: https://fidibo.com/faq/instructions-login-signup?utm_source=chatgpt.com
[8]: https://tolonews.com/fa/front?Itemid=3&id=2&layout=blog&option=com_content&page=30%2C1%2C29%2C40%2C27&view=category&utm_source=chatgpt.com
