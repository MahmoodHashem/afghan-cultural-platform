import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

import { MobileAppShell } from "@/components/layout/mobile/mobile-app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import {
  createRobotsMetadata,
  createSocialMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo/metadata";
import { getPublicSiteUrl } from "@/lib/seo/site-url";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";
import "./mobile-app.css";

/**
 * Primary UI typeface. Regular and SemiBold use the Latin-digit cut so LTR values (emails, codes)
 * keep Latin numerals; Medium and Bold are only installed in the FaNum (Persian-digit) cut.
 */
const kalameh = localFont({
  src: [
    { path: "../../public/fonts/KalamehWeb-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/KalamehWebFaNum-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/KalamehWeb-SemiBold.woff", weight: "600", style: "normal" },
    { path: "../../public/fonts/KalamehWebFaNum-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-kalameh",
  fallback: ["Vazirmatn", "Tahoma", "sans-serif"],
});

/** Calligraphic display face for watermark words, quotes and other decorative headings. */
const reyhan = localFont({
  src: "../../public/fonts/Reyhan.ttf",
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-reyhan",
  // The shipped metrics reserve ~3.5em of vertical space; tighten them to the visible ink so
  // the calligraphy centres in normal line boxes.
  declarations: [
    { prop: "ascent-override", value: "110%" },
    { prop: "descent-override", value: "45%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

/** Hand-drawn accent face for numerals, eyebrows and small decorative labels. */
const leila = localFont({
  src: "../../public/fonts/Leila.ttf",
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-leila",
  // The shipped ascent is shorter than the drawn letters; widen it so glyphs are not clipped.
  declarations: [
    { prop: "ascent-override", value: "115%" },
    { prop: "descent-override", value: "30%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

export const metadata: Metadata = {
  metadataBase: getPublicSiteUrl(),
  title: {
    default: "میراث افغانستان",
    template: "%s | میراث افغانستان",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "فرهنگ و میراث افغانستان",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  ...createSocialMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    canonicalPath: "/",
  }),
  robots: createRobotsMetadata(),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1622" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${kalameh.variable} ${reyhan.variable} ${leila.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextTopLoader
          color="var(--primary)"
          height={2}
          showSpinner={false}
          shadow={false}
          easing="ease-out"
          speed={220}
          crawlSpeed={180}
          showForHashAnchor={false}
          zIndex={2000}
        />
        <ThemeProvider>
          <AppProviders>
            {children}
            <Suspense fallback={null}>
              <MobileAppShell />
            </Suspense>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
