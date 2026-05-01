import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email or phone is required"),  // accepts email or mobile
  password: z.string().min(6),
  fcmToken: z.string().optional().describe("Firebase Cloud Messaging token for push notifications"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);
    // Look up by email OR mobile number
    const isNumeric = /^\d+$/.test(payload.email);
    const alternateMobile = isNumeric 
      ? (payload.email.startsWith('0') ? payload.email.substring(1) : `0${payload.email}`)
      : undefined;

    const orConditions: any[] = [
      { email: payload.email },
      { mobile: payload.email },
    ];

    if (alternateMobile) {
      orConditions.push({ mobile: alternateMobile });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
      include: { customer: true }
    });

    let isPasswordValid = false;
    if (user) {
      if (payload.password === user.passwordHash) {
        isPasswordValid = true;
      } else {
        const isPasswordNumeric = /^\d+$/.test(payload.password);
        if (isPasswordNumeric) {
          const alternatePassword = payload.password.startsWith('0') 
            ? payload.password.substring(1) 
            : `0${payload.password}`;
          if (alternatePassword === user.passwordHash) {
            isPasswordValid = true;
          }
        }
      }
    }

    if (!user || !isPasswordValid) {
      return NextResponse.json({ error: "البريد الإلكتروني أو رقم الهاتف أو كلمة المرور غير صحيحة" }, { status: 401 });
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
    if (payload.fcmToken) {
      console.log(`[LOGIN TRACE] Received FCM token in login payload for user ${user.id}:`, payload.fcmToken);
      const currentTokens = (Array.isArray(user.fcmTokens) ? user.fcmTokens : []) as string[];
      if (!currentTokens.includes(payload.fcmToken)) {
        console.log(`[LOGIN TRACE] Saving NEW FCM token to user ${user.id} database.`);
        const newTokens = [...currentTokens, payload.fcmToken];
        await prisma.user.update({
          where: { id: user.id },
          data: {
            fcmTokens: newTokens
          }
        });
        user.fcmTokens = newTokens;
      } else {
        console.log(`[LOGIN TRACE] FCM token already exists for user ${user.id}.`);
      }
    } else {
      console.log(`[LOGIN TRACE] NO FCM token provided in login payload for user ${user.id}.`);
    }

    const currentTokensFinal = (Array.isArray(user.fcmTokens) ? user.fcmTokens : []) as string[];
    console.log(`[LOGIN TRACE] User ${user.id} currently has ${currentTokensFinal.length} FCM tokens saved in DB.`);
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email ?? "",
      tokenVersion: user.tokenVersion,
      customerId: user.customerId,
      photoUrl: user.photoUrl,
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email ?? "",
      tokenVersion: user.tokenVersion,
      customerId: user.customerId,
      photoUrl: user.photoUrl,
    });

    const response = NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      accessToken, // Return the token to the client
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        mobile: user.mobile,
        customerId: user.customerId,
        code: user.customer?.code,
        dubaiCode: user.customer?.dubaiCode,
        usaCode: user.customer?.usaCode,
        turkeyCode: user.customer?.turkeyCode,
        hasFcmToken: Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0,
        fcmTokens: Array.isArray(user.fcmTokens) ? user.fcmTokens : [],
        photoUrl: user.photoUrl,
      }
    });
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      secure: false, // Set to false to support HTTP deployments (IP addresses)
      sameSite: "lax",
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
      secure: false, // Set to false to support HTTP deployments (IP addresses)
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "طلب غير صالح" }, { status: 400 });
  }
}
