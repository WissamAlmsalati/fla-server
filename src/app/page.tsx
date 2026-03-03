import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شركة الولاء الدائم للشحن | Alwala International Shipping",
  description: "شركة الولاء الدائم للشحن الجوي والبحري من الصين، دبي، أمريكا وتركيا إلى ليبيا. تتبع شحناتك في الوقت الفعلي. | Alwala International Shipping — Air & Sea freight from China, Dubai, USA, Turkey to Libya.",
  keywords: ["شركة شحن ليبيا", "شحن من الصين", "شحن جوي", "شحن بحري", "الولاء للشحن", "Libya shipping", "China freight", "Alwala shipping"],
  openGraph: {
    title: "شركة الولاء الدائم للشحن | Alwala Shipping",
    description: "شحن جوي وبحري من الصين، دبي، أمريكا وتركيا إلى ليبيا بأفضل الأسعار وأسرع وقت.",
    type: "website",
    locale: "ar_LY",
    alternateLocale: "en_US",
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (token) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
