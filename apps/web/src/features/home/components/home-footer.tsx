import Image from "next/image";
import Link from "next/link";
import { siFacebook, siInstagram, siX, siYoutube } from "simple-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

type FooterLink = {
  label: string;
  href: string;
};

type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

type SocialIconDefinition = {
  label: string;
  path: string;
  className?: string;
};

const quickLinks: FooterLinkGroup = {
  title: "دسترسی سریع",
  links: [
    { label: "موضوع‌ها", href: "/categories" },
    { label: "ولایت‌ها", href: "/provinces" },
    { label: "مطالب", href: "/explore" },
    { label: "درباره ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
  ],
};

const resourceLinks: FooterLinkGroup = {
  title: "منابع",
  links: [
    { label: "راهنما", href: "/help" },
    { label: "سؤالات متداول", href: "/faq" },
    { label: "شرایط استفاده", href: "/terms" },
    { label: "حریم خصوصی", href: "/privacy" },
  ],
};

const socialIcons: SocialIconDefinition[] = [
  { label: "اینستاگرام", path: siInstagram.path },
  { label: "فیسبوک", path: siFacebook.path, className: "text-[#1877F2]" },
  { label: "ایکس", path: siX.path },
  { label: "یوتیوب", path: siYoutube.path, className: "text-[#FF0000]" },
];

function Footer() {
  const currentYear = formatPersianNumber(new Date().getFullYear(), { useGrouping: false });

  return (
    <footer className="w-full border-t border-border bg-background text-foreground">
      <div className="w-full px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.7fr_0.7fr_1.15fr] lg:gap-12">
          <BrandColumn />
          <FooterLinksGroup group={quickLinks} />
          <FooterLinksGroup group={resourceLinks} />
          <NewsletterColumn />
        </div>

        <p className="mt-8 text-center text-[14px] text-muted-foreground">
          © {currentYear} میراث افغانستان. تمام حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
}

function BrandColumn() {
  return (
    <section className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-4 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        aria-label="میراث افغانستان، رفتن به خانه"
      >
        <Image
          src="/images/small-logo.png"
          alt=""
          width={54}
          height={62}
          sizes="54px"
          className="h-14 w-auto"
        />
        <span>
          <span className="block text-[24px] font-bold text-primary">میراث افغانستان</span>
          <span className="mt-1 block text-[15px] font-medium text-muted-foreground">
            فرهنگ، تاریخ، هویت ما
          </span>
        </span>
      </Link>

      <p className="max-w-md text-[16px] leading-9 text-muted-foreground">
        جایی برای گردآوری و شناخت فرهنگ افغانستان
      </p>

      <fieldset className="flex items-center gap-4">
        <legend className="sr-only">شبکه‌های اجتماعی</legend>
        {socialIcons.map((icon) => (
          <button
            key={icon.label}
            type="button"
            className={cn(
              "flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              icon.className,
            )}
            aria-label={icon.label}
          >
            <SocialIcon path={icon.path} />
          </button>
        ))}
      </fieldset>
    </section>
  );
}

function FooterLinksGroup({ group }: { group: FooterLinkGroup }) {
  return (
    <nav className="space-y-4" aria-label={group.title}>
      <h2 className="text-[18px] font-bold text-foreground">{group.title}</h2>
      <ul className="space-y-3">
        {group.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NewsletterColumn() {
  return (
    <section className="space-y-5 lg:border-s lg:border-border lg:ps-12">
      <div className="space-y-3">
        <h2 className="text-[19px] font-bold text-foreground">تازه‌های میراث افغانستان</h2>
        <p className="max-w-md text-[15px] leading-8 text-muted-foreground">
          تازه‌ترین نوشته‌ها را در ایمیل خود دریافت کنید.
        </p>
      </div>

      <div className="max-w-md space-y-3">
        <label htmlFor="footer-email" className="sr-only">
          ایمیل شما
        </label>
        <Input
          id="footer-email"
          type="email"
          dir="ltr"
          placeholder="ایمیل شما"
          className="h-12 rounded-xl border-border bg-background px-4 text-start shadow-none"
        />
        <Button type="button" className="h-12 w-full rounded-xl bg-primary hover:bg-primary-hover">
          عضویت
        </Button>
      </div>
    </section>
  );
}

function SocialIcon({ path }: { path: string }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

export { Footer as HomeFooter };
