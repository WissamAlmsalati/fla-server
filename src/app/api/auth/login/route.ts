import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fcmToken: z.string().optional().describe("Firebase Cloud Messaging token for push notifications"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user || payload.password !== user.passwordHash) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // Check if user account is suspended
    if (user.suspended) {
      return NextResponse.json({ error: "الحساب معلق، يرجى التواصل مع الإدارة" }, { status: 403 });
    }

    // Check if user account is approved (for mobile registrations)
    if (!user.approved) {
      return NextResponse.json({ error: "الحساب قيد المراجعة، يرجى الانتظار حتى يتم قبول طلبك" }, { status: 403 });
    }

    // Add FCM token if not exists
    if (payload.fcmToken && !user.fcmTokens?.includes(payload.fcmToken)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          fcmTokens: {
            push: payload.fcmToken
          }
        }
      });
    }
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      tokenVersion: user.tokenVersion,
      customerId: user.customerId,
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      tokenVersion: user.tokenVersion,
      customerId: user.customerId,
    });

    const response = NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      accessToken, // Return the token to the client
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customerId
      }
    });
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "طلب غير صالح" }, { status: 400 });
  }
}
