import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type JWTPayload = {
  sub: number;
  role: string;
  name: string;
  email: string;
  tokenVersion: number;
  customerId?: number | null;
  photoUrl?: string | null;
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
        if (key && value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.access_token;
    }
  }

  if (!token || token === "null" || token === "undefined") {
    const error = new Error("Missing authorization token");
    (error as any).status = 401;
    throw error;
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as unknown as JWTPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    
    if (!user) {
      const error = new Error("User not found");
      (error as any).status = 401;
      throw error;
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      const error = new Error("Token version mismatch - please login again");
      (error as any).status = 401;
      throw error;
    }

    return {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      customerId: user.customerId,
      photoUrl: user.photoUrl
    };
  } catch (err: any) {
    if (err.status === 401) throw err;
    const error = new Error(err.name === "TokenExpiredError" ? "Session expired" : "Invalid token");
    (error as any).status = 401;
    throw error;
  }
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
