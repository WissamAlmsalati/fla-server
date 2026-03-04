import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const PRIVACY_POLICY_KEY = "privacy_policy";

const DEFAULT_CLAUSES = [
    { title: "١. جمع المعلومات", body: "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو تعديل ملفك الشخصي. قد تشمل هذه المعلومات اسمك وبريدك الإلكتروني ورقم هاتفك." },
    { title: "٢. استخدام المعلومات", body: "نستخدم المعلومات التي نجمعها لتقديم خدماتنا وتحسينها وتخصيصها لك. كما نستخدمها للتواصل معك بشأن حسابك وطلباتك." },
    { title: "٣. أمان البيانات", body: "نتخذ تدابير أمنية ملائمة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح عنه أو إتلافه." },
    { title: "٤. مشاركة المعلومات", body: "لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع شركاء الخدمة الموثوقين لمساعدتنا في تشغيل التطبيق." },
    { title: "٥. التحديثات والتعديلات", body: "قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع إشعار مسبق في حال وجود تغييرات جوهرية." },
];

interface Clause { title: string; body: string; }

function computeDiff(prev: Clause[], next: Clause[]): string {
    const parts: string[] = [];
    const added = next.length - prev.length;

    if (added > 0) parts.push(`تمت إضافة ${added} بند${added > 1 ? "اً" : ""}`);
    else if (added < 0) parts.push(`تم حذف ${Math.abs(added)} بند${Math.abs(added) > 1 ? "اً" : ""}`);

    // Check modified clauses (compare by position for simplicity)
    const modifiedTitles: string[] = [];
    const minLen = Math.min(prev.length, next.length);
    for (let i = 0; i < minLen; i++) {
        if (prev[i].title !== next[i].title || prev[i].body !== next[i].body) {
            modifiedTitles.push(next[i].title);
        }
    }
    if (modifiedTitles.length > 0) {
        parts.push(`تم تعديل: ${modifiedTitles.slice(0, 3).join("، ")}${modifiedTitles.length > 3 ? " وآخرون" : ""}`);
    }

    return parts.length > 0 ? parts.join(" | ") : `إجمالي البنود: ${next.length}`;
}

// GET — public
export async function GET() {
    try {
        const setting = await prisma.siteSettings.findUnique({ where: { key: PRIVACY_POLICY_KEY } });
        const clauses = setting ? JSON.parse(setting.value) : DEFAULT_CLAUSES;
        return NextResponse.json({ clauses });
    } catch {
        return NextResponse.json({ clauses: DEFAULT_CLAUSES });
    }
}

// PUT — admin only
export async function PUT(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const body = await request.json();
        const { clauses, note }: { clauses: Clause[]; note?: string } = body;

        if (!Array.isArray(clauses) || clauses.length === 0)
            return NextResponse.json({ error: "Clauses array is required" }, { status: 400 });

        for (const clause of clauses) {
            if (!clause.title || !clause.body)
                return NextResponse.json({ error: "كل بند يجب أن يحتوي على عنوان وتوضيح" }, { status: 400 });
        }

        // Fetch previous version for diff
        const existing = await prisma.siteSettings.findUnique({ where: { key: PRIVACY_POLICY_KEY } });
        const prevClauses: Clause[] = existing ? JSON.parse(existing.value) : DEFAULT_CLAUSES;

        // Auto-generate diff summary
        const diffSummary = computeDiff(prevClauses, clauses);

        // Save new policy
        await prisma.siteSettings.upsert({
            where: { key: PRIVACY_POLICY_KEY },
            update: { value: JSON.stringify(clauses) },
            create: { key: PRIVACY_POLICY_KEY, value: JSON.stringify(clauses) },
        });

        // Save audit log with snapshot + diff
        await prisma.settingsChangeLog.create({
            data: {
                settingKey: PRIVACY_POLICY_KEY,
                changedById: auth.sub,
                changedByName: auth.name ?? "مدير",
                note: note || null,
                diffSummary,
                snapshot: JSON.stringify(clauses),
            },
        });

        return NextResponse.json({ clauses, message: "تم الحفظ بنجاح" });
    } catch (error) {
        console.error("PUT privacy-policy error:", error);
        return NextResponse.json({ error: "Failed to update privacy policy" }, { status: 500 });
    }
}

// PATCH — fetch logs (admin only)
export async function PATCH(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const logs = await prisma.settingsChangeLog.findMany({
            where: { settingKey: PRIVACY_POLICY_KEY },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ logs });
    } catch {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
