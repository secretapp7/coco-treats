import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { PublicSettingsProvider } from "@/components/public-settings-provider";
import { getPublicBusinessSettings } from "@/lib/settings/public-settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coco Treats · Homemade Desserts in Muscat",
  description:
    "Order fresh tiramisu and jelly cheesecake from Coco Treats in Muscat through WhatsApp.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicSettings = await getPublicBusinessSettings();

  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-[color:var(--foreground)]">
        <PublicSettingsProvider settings={publicSettings}>
          <LanguageProvider>{children}</LanguageProvider>
        </PublicSettingsProvider>
      </body>
    </html>
  );
}
