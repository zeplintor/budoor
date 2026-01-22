import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { isRTL, type Locale } from "@/i18n/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Budoor - Intelligence Agricole",
  description: "Un agronome expert dans votre poche, qui surveille vos champs 24h/24",
};

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
      <body className={`${inter.variable} ${notoSansArabic.variable} ${rtl ? "font-arabic" : "font-sans"} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider initialLocale={locale}>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
