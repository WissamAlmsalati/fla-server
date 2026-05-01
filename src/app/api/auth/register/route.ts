import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(10).optional(),
    location: z.string().optional(),
    fcmToken: z.string().optional().describe("Firebase Cloud Messaging token for push notifications"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = registerSchema.parse(body);

        // Check if user already exists
        const orConditions: any[] = [{ email: payload.email }];
        if (payload.mobile) orConditions.push({ mobile: payload.mobile });

        const existingUser = await prisma.user.findFirst({
            where: { OR: orConditions },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل" },
                { status: 400 }
            );
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Clean up any existing pending registration for this email/mobile
        const cleanupConditions: any[] = [{ email: payload.email }];
        if (payload.mobile) cleanupConditions.push({ mobile: payload.mobile });
        await prisma.pendingRegistration.deleteMany({
            where: { OR: cleanupConditions },
        });

        await prisma.pendingRegistration.create({
            data: {
                name: payload.name,
                email: payload.email,
                passwordHash: payload.password, // Storing as is, matching existing system
                mobile: payload.mobile,
                location: payload.location,
                otp,
                fcmToken: payload.fcmToken,
                expiresAt,
            },
        });

        // Send OTP via Email
        await sendEmail({
            to: payload.email,
            subject: "Your OTP for Registration",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; text-align: right; background-color: #f6f6f6; padding: 40px 20px;">
                    <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        
                        <!-- Logo Header -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://fll.com.ly/photos/logo-without-bg.png" alt="الولاء الدائم Logo" style="max-height: 80px; margin-bottom: 15px;" onerror="this.style.display='none'">
                            <h1 style="color: #4AC1C2; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">الولاء الدائم</h1>
                            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Alwala System</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="color: #020617;">
                            <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 20px;">مرحباً ${payload.name}،</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 30px;">
                                شكراً لتسجيلك في نظام الولاء الدائم. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #f0fdfd; border: 1px solid #4AC1C2; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
                                <h1 style="font-size: 36px; letter-spacing: 8px; color: #4AC1C2; margin: 0; font-family: monospace;">
                                    ${otp}
                                </h1>
                            </div>
                            
                            <p style="font-size: 15px; color: #64748b; margin-bottom: 0;">
                                هذا الرمز صالح لمدة <strong style="color: #4AC1C2;">10 دقائق</strong>. يرجى إدخاله في التطبيق للبدء.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="font-size: 13px; color: #94a3b8; margin: 0;">
                                رسالة تلقائية، يرجى عدم الرد.<br>
                                &copy; ${new Date().getFullYear()} شركة الولاء الدائم. جميع الحقوق محفوظة.
                            </p>
                        </div>

                    </div>
                </div>
            `
        });

        console.log("\n\n=======================================================");
        console.log("🔐🔐🔐 NEW OTP GENERATED 🔐🔐🔐");
        console.log(`👉 EMAIL: ${payload.email}`);
        console.log(`👉 OTP:   ${otp}`);
        console.log("=======================================================\n\n");

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Invalid request" },
            { status: 400 }
        );
    }
}
