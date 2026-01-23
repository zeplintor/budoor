import type { Metadata } from "next";
import { DM_Sans, Outfit, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { isRTL, type Locale } from "@/i18n/config";
import { defaultMetadata } from "@/lib/metadata";

// Body font - DM Sans (warm, readable, distinctive)
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Display font - Outfit (geometric, modern, bold)
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
      <body className={`${dmSans.variable} ${outfit.variable} ${notoSansArabic.variable} ${rtl ? "font-arabic" : "font-body"} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider initialLocale={locale}>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
