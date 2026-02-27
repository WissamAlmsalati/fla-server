import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const verifyResetOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = verifyResetOtpSchema.parse(body);

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

        return NextResponse.json({ message: "الرمز صحيح" });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "طلب غير صالح" },
            { status: 400 }
        );
    }
}
