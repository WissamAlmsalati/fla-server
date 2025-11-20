import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, JWTPayload } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = request.cookies.get("refresh_token")?.value;
    if (!token) throw new Error("Missing refresh token");

    const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as JWTPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || payload.tokenVersion !== user.tokenVersion) {
      throw new Error("Token invalid");
    }

    const nextPayload: JWTPayload = {
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    const accessToken = signAccessToken(nextPayload);
    const refreshToken = signRefreshToken(nextPayload);

    const response = NextResponse.json({ message: "Rotated tokens" });
    response.cookies.set("access_token", accessToken, { httpOnly: true, path: "/" });
    response.cookies.set("refresh_token", refreshToken, { httpOnly: true, path: "/api/auth/refresh" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 401 });
  }
}
