import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

import { MobileAppShell } from "@/components/layout/mobile/mobile-app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";
import "./mobile-app.css";

export const metadata: Metadata = {
  title: "میراث افغانستان",
  description: "A crowdsourced platform for preserving and sharing Afghan cultural information.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <NextTopLoader
          color="#0F766E"
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
