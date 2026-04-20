import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/sonner";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fll.com.ly'),
  title: {
    default: "شركة الولاء الدائم للشحن",
    template: "%s | شركة الولاء الدائم",
  },
  description: "خدمات الشحن الجوي والبحري من الصين، دبي، أمريكا، وتركيا إلى ليبيا. نظام تتبع وإدارة شحنات مباشر.",
  applicationName: "Alwala Shipping",
  keywords: ["شركة شحن في ليبيا", "تتبع شحنات", "شحن من الصين", "شحن من أمريكا", "الولاء الدائم للشحن", "الشحن الجوي إلى ليبيا"],
  openGraph: {
    title: "شركة الولاء الدائم للشحن",
    description: "الشحن الدولي الموثوق وتتبع الشحنات بخطوات بسيطة.",
    url: "https://fll.com.ly",
    siteName: "شركة الولاء الدائم",
    locale: "ar_LY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "شركة الولاء الدائم للشحن",
    description: "الشحن الدولي الموثوق وتتبع الشحنات بخطوات بسيطة.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${almarai.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
