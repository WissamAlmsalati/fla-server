import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const changePasswordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const payload = changePasswordSchema.parse(body);

        const dbUser = await prisma.user.findUnique({
            where: { id: user.sub },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
        }

        if (dbUser.passwordHash !== payload.oldPassword) {
            return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.sub },
            data: { passwordHash: payload.newPassword },
        });

        return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "طلب غير صالح" },
            { status: 400 }
        );
    }
}
