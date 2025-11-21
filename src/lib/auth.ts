import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type JWTPayload = {
  sub: number;
  role: string;
  tokenVersion: number;
};

export async function requireAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) throw new Error("Missing authorization token");

  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as unknown as JWTPayload;
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new Error("Invalid token");
  }
  return { ...payload, customerId: user.customerId };
}

export function signAccessToken(payload: JWTPayload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: JWTPayload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
}
