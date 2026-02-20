import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type JWTPayload = {
  sub: number;
  role: string;
  name: string;
  email: string;
  tokenVersion: number;
  customerId?: number | null;
};

export async function requireAuth(request: Request) {
  // Check Authorization header first (for mobile app)
  const authHeader = request.headers.get("authorization");
  let token = authHeader?.split(" ")[1];

  // If no Authorization header, check cookies (for web dashboard)
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.access_token;
    }
  }

  if (!token) throw new Error("Missing authorization token");

  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as unknown as JWTPayload;
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new Error("Invalid token");
  }
  return {
    ...payload,
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    customerId: user.customerId
  };
}

export function signAccessToken(payload: JWTPayload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "1d",
  });
}

export function signRefreshToken(payload: JWTPayload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
}
