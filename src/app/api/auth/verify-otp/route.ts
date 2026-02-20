import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    fcmToken: z.string().optional().describe("Firebase Cloud Messaging token for push notifications"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = verifySchema.parse(body);

        const pendingUser = await prisma.pendingRegistration.findUnique({
            where: { email: payload.email },
        });

        if (!pendingUser) {
            return NextResponse.json(
                { error: "Registration request not found or expired" },
                { status: 404 }
            );
        }

        if (pendingUser.otp !== payload.otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (new Date() > pendingUser.expiresAt) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        // Create User only (Customer will be created on approval)
        const user = await prisma.user.create({
            data: {
                name: pendingUser.name,
                email: pendingUser.email,
                passwordHash: pendingUser.passwordHash,
                mobile: pendingUser.mobile,
                role: "CUSTOMER",
                approved: false, // Requires admin approval
                ...(payload.fcmToken ? { fcmTokens: [payload.fcmToken] } : {}),
            },
        });

        // Delete pending registration
        await prisma.pendingRegistration.delete({
            where: { id: pendingUser.id },
        });

        return NextResponse.json({
            message: "User verified and created successfully",
            userId: user.id
        });
    } catch (error) {
        console.error("Error in verify-otp:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Invalid request" },
            { status: 400 }
        );
    }
}
