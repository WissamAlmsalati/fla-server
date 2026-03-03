import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);

        // Make sure user doesn't already have an email
        const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (dbUser.email) {
            return NextResponse.json(
                { error: "البريد الإلكتروني مضاف بالفعل ولا يمكن تغييره" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { email, otp } = schema.parse(body);

        // Look up the OTP using the temp key
        const tempEmail = `email_verify:${user.sub}:${email}`;
        const record = await prisma.passwordResetCode.findFirst({
            where: { email: tempEmail },
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

        // Double-check email not taken (race condition)
        const existingWithEmail = await prisma.user.findUnique({ where: { email } });
        if (existingWithEmail) {
            return NextResponse.json(
                { error: "هذا البريد الإلكتروني مستخدم بالفعل" },
                { status: 400 }
            );
        }

        // Save email permanently
        const updatedUser = await prisma.user.update({
            where: { id: user.sub },
            data: { email },
            include: { customer: true },
        });

        // Clean up OTP record
        await prisma.passwordResetCode.deleteMany({ where: { email: tempEmail } });

        return NextResponse.json({
            message: "تم تأكيد البريد الإلكتروني بنجاح",
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
