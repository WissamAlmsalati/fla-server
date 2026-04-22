import { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية - Privacy Policy",
  description: "Privacy Policy for the application",
};

// Next.js caching strategy: revalidate at most every hour or when requested
export const revalidate = 3600;

interface Clause {
  title: string;
  body: string;
}

const DEFAULT_CLAUSES: Clause[] = [
  { title: "١. جمع المعلومات", body: "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو تعديل ملفك الشخصي. قد تشمل هذه المعلومات اسمك وبريدك الإلكتروني ورقم هاتفك." },
  { title: "٢. استخدام المعلومات", body: "نستخدم المعلومات التي نجمعها لتقديم خدماتنا وتحسينها وتخصيصها لك. كما نستخدمها للتواصل معك بشأن حسابك وطلباتك." },
  { title: "٣. أمان البيانات", body: "نتخذ تدابير أمنية ملائمة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح عنه أو إتلافه." },
  { title: "٤. مشاركة المعلومات", body: "لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع شركاء الخدمة الموثوقين لمساعدتنا في تشغيل التطبيق." },
  { title: "٥. التحديثات والتعديلات", body: "قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع إشعار مسبق في حال وجود تغييرات جوهرية." },
];

async function loadPrivacyPolicyFromDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const { prisma } = await import("@/lib/prisma");
  return prisma.siteSettings.findUnique({
    where: { key: "privacy_policy" },
  });
}

export default async function PrivacyPolicyPage() {
  let clauses: Clause[] = DEFAULT_CLAUSES;
  let lastUpdated = new Date();

  try {
    const setting = await loadPrivacyPolicyFromDb();

    if (setting && setting.value) {
      clauses = JSON.parse(setting.value);
      lastUpdated = setting.updatedAt;
    }
  } catch (error) {
    console.error("Failed to load privacy policy from DB:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow-sm rounded-xl">
        <div dir="rtl" className="mb-12">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">سياسة الخصوصية</h1>
          <p className="mb-8 text-sm text-gray-500">آخر تحديث: {lastUpdated.toLocaleDateString('ar-EG')}</p>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            {clauses.map((clause, index) => (
              <section key={index}>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">{clause.title}</h2>
                <p className="whitespace-pre-wrap">{clause.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
