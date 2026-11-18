import Image from "next/image";
import Link from "next/link";

import { formatPersianNumber } from "@/lib/utils/formatters";

type FooterLink = {
  label: string;
  href: string;
};

type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

const quickLinks: FooterLinkGroup = {
  title: "دسترسی سریع",
  links: [
    { label: "مطالب", href: "/explore" },
    { label: "ولایت‌ها", href: "/provinces" },
    { label: "موضوع‌ها", href: "/categories" },
    { label: "افزودن مطلب", href: "/entries/new" },
    { label: "درباره ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
  ],
};

const resourceLinks: FooterLinkGroup = {
  title: "منابع",
  links: [
    { label: "راهنمای نوشتن", href: "/faq#faq-contribution" },
    { label: "سؤالات متداول", href: "/faq" },
    { label: "شرایط استفاده", href: "/terms" },
    { label: "حریم خصوصی", href: "/privacy" },
  ],
};

const legalLinks: FooterLink[] = [
  { label: "شرایط استفاده", href: "/terms" },
  { label: "حریم خصوصی", href: "/privacy" },
  { label: "تماس با ما", href: "/contact" },
];

/** A line from Rumi's Masnavi (public domain): longing for one's origin, the spirit of the archive. */
const footerVerse = "هر کسی کو دور ماند از اصل خویش، باز جوید روزگار وصل خویش";

/**
 * Site footer: a dark night band with brand, link columns, a calligraphic verse over a line-drawn
 * skyline (mountains, a minaret and a dome), and a red legal bar.
 */
function Footer() {
  const currentYear = formatPersianNumber(new Date().getFullYear(), { useGrouping: false });

  return (
    <footer className="relative w-full overflow-hidden bg-footer text-footer-text">
      <div className="content-container grid gap-10 pt-14 pb-6 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.45fr_0.75fr] lg:gap-12">
        <BrandColumn />
        <FooterLinksGroup group={quickLinks} columns={2} />
        <FooterLinksGroup group={resourceLinks} />
      </div>

      <FooterSkyline />

      <div className="bg-primary text-white">
        <div className="content-container flex flex-col items-center justify-between gap-2 py-3.5 text-[12px] md:flex-row">
          <p>© {currentYear} میراث افغانستان. بازنشر مطالب با ذکر منبع آزاد است.</p>
          <nav aria-label="پیوندهای حقوقی" className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/85 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function BrandColumn() {
  return (
    <section className="space-y-5 sm:col-span-2 lg:col-span-1">
      <Link
        href="/"
        className="inline-flex items-center gap-3 rounded-bubble-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        aria-label="میراث افغانستان، رفتن به خانه"
      >
        <Image
          src="/images/small-logo.png"
          alt=""
          width={54}
          height={62}
          sizes="54px"
          className="h-12 w-auto brightness-0 invert"
        />
        <span>
          <span className="block text-[20px] font-bold text-white">میراث افغانستان</span>
          <span className="mt-1 block text-[12px] font-medium text-footer-text/80">
            فرهنگ، تاریخ، هویت ما
          </span>
        </span>
      </Link>

      <p className="max-w-md text-[13.5px] leading-[2.1]">
        جایی برای گردآوری و شناخت فرهنگ افغانستان؛ نوشته‌هایی درباره‌ی ولایت‌ها، مشاهیر، بناهای
        تاریخی، آیین‌ها و دانش محلی که با همراهی شما کامل‌تر می‌شود.
      </p>
    </section>
  );
}

function FooterLinksGroup({ group, columns = 1 }: { group: FooterLinkGroup; columns?: 1 | 2 }) {
  return (
    <nav className="space-y-4" aria-label={group.title}>
      <h2 className="flex items-center gap-3 text-[15px] font-bold text-white after:h-0.5 after:w-11 after:bg-[radial-gradient(circle,rgba(207,218,235,0.55)_0.8px,transparent_1.1px)] after:bg-size-[7px_2px] after:bg-repeat-x">
        {group.title}
      </h2>
      <ul className={columns === 2 ? "columns-2 gap-x-10" : undefined}>
        {group.links.map((link) => (
          <li key={link.href} className="mb-3 break-inside-avoid">
            <Link
              href={link.href}
              className="relative inline-block text-[13.5px] text-footer-text transition-colors duration-200 outline-none after:absolute after:inset-x-0 after:-bottom-1 after:h-[1.5px] after:origin-right after:scale-x-0 after:rounded-full after:bg-gold after:transition-transform after:duration-[380ms] after:ease-expo hover:text-white hover:after:scale-x-100 focus-visible:text-white focus-visible:after:scale-x-100"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterSkyline() {
  return (
    <div className="relative mt-4 h-40 sm:h-48" aria-hidden="true">
      <p className="absolute inset-x-0 top-0 text-center font-calli text-[26px] text-white/30 sm:text-[34px]">
        {footerVerse}
      </p>
      <svg
        viewBox="0 0 1200 160"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-28 w-full text-white/14 sm:h-32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M0 150 L120 96 L190 128 L300 70 L390 120 L470 92 L560 140 L1200 140"
          strokeWidth="1.2"
        />
        <path d="M640 150 L760 104 L860 132 L980 84 L1080 126 L1200 100" strokeWidth="1" />
        <path d="M0 152 H1200" strokeWidth="1" />
        {/* Minaret (in the spirit of the Minaret of Jam) */}
        <path
          d="M842 152 V58 M862 152 V58 M838 58 H866 M846 58 V40 H858 V58 M852 40 V30"
          strokeWidth="1.2"
        />
        <path d="M842 96 H862 M842 120 H862" strokeWidth="0.8" />
        {/* Dome with drum, as on the mosques of Herat and Mazar */}
        <path
          d="M300 152 V124 H372 V152 M308 124 C308 98 364 98 364 124 M336 101 V88"
          strokeWidth="1.2"
        />
        <circle
          cx="336"
          cy="85"
          r="3"
          className="text-gold"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export { Footer as HomeFooter };
