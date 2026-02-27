import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const saveTokenSchema = z.object({
    fcmToken: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = saveTokenSchema.parse(body);

        // Check if user is authenticated (Optional, as the token might be sent before login)
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: number };

                // Update user's FCM tokens
                await prisma.user.update({
                    where: { id: decoded.userId },
                    data: {
                        fcmTokens: {
                            push: payload.fcmToken,
                        },
                    },
                });

                return NextResponse.json({ message: "Token saved to user profile" });
            } catch (jwtError) {
                // Ignore JWT errors, we'll just fall through to the generic success
                console.log("Invalid JWT when saving FCM token");
            }
        }

        console.log(`[FCM] Received token from unauthenticated device: ${payload.fcmToken}`);

        return NextResponse.json({ message: "Token received" });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Invalid request" },
            { status: 400 }
        );
    }
}
