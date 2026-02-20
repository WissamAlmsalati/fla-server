import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const fcmTokenSchema = z.object({
    fcmToken: z.string().min(1, "Token is required"),
});

export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { fcmToken } = fcmTokenSchema.parse(body);

        const dbUser = await prisma.user.findUnique({
            where: { id: user.sub },
            select: { fcmTokens: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Add token if it doesn't already exist
        let newTokens = dbUser.fcmTokens;
        if (!newTokens.includes(fcmToken)) {
            newTokens.push(fcmToken);

            await prisma.user.update({
                where: { id: user.sub },
                data: { fcmTokens: newTokens },
            });
        }

        return NextResponse.json({ message: "Token registered successfully" });
    } catch (error) {
        console.error("FCM Token registration error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to register token" },
            { status: 400 }
        );
    }
}
