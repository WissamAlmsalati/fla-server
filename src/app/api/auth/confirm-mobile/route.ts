import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
    mobile: z.string().min(10),
    otp: z.string().length(6),
});

export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);

        const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
        if (!dbUser) {
            return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
        }
        if (dbUser.mobile) {
            return NextResponse.json(
                { error: "رقم الهاتف مضاف بالفعل ولا يمكن تغييره" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { mobile, otp } = schema.parse(body);

        // Look up the OTP
        const tempKey = `mobile_verify:${user.sub}:${mobile}`;
        const record = await prisma.passwordResetCode.findFirst({
            where: { email: tempKey },
        });

        if (!record) {
            return NextResponse.json(
                { error: "رمز التحقق غير موجود، يرجى طلب رمز جديد" },
                { status: 404 }
            );
        }

        if (record.code !== otp) {
            return NextResponse.json(
                { error: "رمز التحقق غير صحيح" },
                { status: 400 }
            );
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json(
                { error: "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد" },
                { status: 400 }
            );
        }

        // Double-check mobile not taken (race condition)
        const existingWithMobile = await prisma.user.findFirst({ where: { mobile } });
        if (existingWithMobile) {
            return NextResponse.json(
                { error: "رقم الهاتف مستخدم بالفعل" },
                { status: 400 }
            );
        }

        // Save mobile permanently
        const updatedUser = await prisma.user.update({
            where: { id: user.sub },
            data: { mobile },
            include: { customer: true },
        });

        // Clean up OTP record
        await prisma.passwordResetCode.deleteMany({ where: { email: tempKey } });

        return NextResponse.json({
            message: "تم تأكيد رقم الهاتف بنجاح",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                customerId: updatedUser.customerId,
                mobile: updatedUser.mobile,
                code: updatedUser.customer?.code,
                dubaiCode: updatedUser.customer?.dubaiCode,
                usaCode: updatedUser.customer?.usaCode,
                turkeyCode: updatedUser.customer?.turkeyCode,
                location: updatedUser.location,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "طلب غير صالح" },
            { status: 400 }
        );
    }
}
