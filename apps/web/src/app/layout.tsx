import type { Metadata } from "next";

import { ThemeProvider } from "@/components/layout/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "میراث افغانستان",
  description: "A crowdsourced platform for preserving and sharing Afghan cultural information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
