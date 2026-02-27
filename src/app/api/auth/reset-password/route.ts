import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = resetPasswordSchema.parse(body);

        const resetCode = await prisma.passwordResetCode.findFirst({
            where: {
                email: payload.email,
                code: payload.otp,
            },
        });

        if (!resetCode) {
            return NextResponse.json({ error: "رمز إعادة التعيين غير صحيح" }, { status: 400 });
        }

        if (resetCode.expiresAt < new Date()) {
            await prisma.passwordResetCode.delete({ where: { id: resetCode.id } });
            return NextResponse.json({ error: "رمز إعادة التعيين منتهي الصلاحية" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
        }

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: payload.newPassword },
        });

        // Delete the used reset code
        await prisma.passwordResetCode.delete({ where: { id: resetCode.id } });

        // Also delete any other codes for this email just in case
        await prisma.passwordResetCode.deleteMany({
            where: { email: payload.email },
        });

        return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "طلب غير صالح" },
            { status: 400 }
        );
    }
}
