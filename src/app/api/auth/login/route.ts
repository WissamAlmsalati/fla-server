import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user || payload.password !== user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json({ 
      message: "Authenticated",
      accessToken, // Return the token to the client
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15,
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
