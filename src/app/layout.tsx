import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { isRTL, type Locale } from "@/i18n/config";
import { defaultMetadata } from "@/lib/metadata";

// Body font - Plus Jakarta Sans (clean, modern, readable)
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Display font - Syne (geometric sans, bold, distinctive — no serif)
const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale() as Locale;
  const messages = await getMessages();
  const rtl = isRTL(locale);

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
      <body suppressHydrationWarning className={`${plusJakartaSans.variable} ${syne.variable} ${notoSansArabic.variable} ${rtl ? "font-arabic" : "font-body"} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider initialLocale={locale}>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
