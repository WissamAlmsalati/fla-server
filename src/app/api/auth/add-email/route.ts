import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
    email: z.string().email(),
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
        const { email } = schema.parse(body);

        // Check the email is not already taken by another user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "هذا البريد الإلكتروني مستخدم بالفعل" },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Reuse PasswordResetCode table to store the email OTP
        // We'll use a special prefix for the email to distinguish from password resets
        const tempEmail = `email_verify:${user.sub}:${email}`;

        await prisma.passwordResetCode.deleteMany({
            where: { email: tempEmail },
        });

        await prisma.passwordResetCode.create({
            data: {
                email: tempEmail,
                code: otp,
                expiresAt,
            },
        });

        // Send OTP email
        await sendEmail({
            to: email,
            subject: "تأكيد البريد الإلكتروني - الولاء الدائم",
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; text-align: right; background-color: #f6f6f6; padding: 40px 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4AC1C2; font-size: 28px; font-weight: 800; margin: 0;">الولاء الدائم</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Alwala System</p>
            </div>
            <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 20px;">تأكيد البريد الإلكتروني</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 30px;">
              لإضافة بريدك الإلكتروني إلى حسابك، يرجى استخدام رمز التحقق التالي:
            </p>
            <div style="background-color: #f0fdfd; border: 1px solid #4AC1C2; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 36px; letter-spacing: 8px; color: #4AC1C2; margin: 0; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            <p style="font-size: 15px; color: #64748b; margin-bottom: 15px;">
              هذا الرمز صالح لمدة <strong style="color: #4AC1C2;">15 دقيقة</strong>.
            </p>
            <div style="background-color: #f8fafc; border-right: 4px solid #cbd5e1; padding: 15px; margin-top: 30px;">
              <p style="font-size: 14px; color: #64748b; margin: 0;">
                إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذه الرسالة.
              </p>
            </div>
          </div>
        </div>
      `,
        });

        console.log(`[ADD EMAIL] OTP for user ${user.sub} → email: ${email} → OTP: ${otp}`);

        return NextResponse.json({
            message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "طلب غير صالح" },
            { status: 400 }
        );
    }
}
