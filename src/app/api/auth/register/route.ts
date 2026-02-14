import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(10),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: payload.email },
                    { mobile: payload.mobile },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or mobile already exists" },
                { status: 400 }
            );
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Clean up any existing pending registration for this email/mobile
        await prisma.pendingRegistration.deleteMany({
            where: {
                OR: [
                    { email: payload.email },
                    { mobile: payload.mobile },
                ],
            },
        });

        await prisma.pendingRegistration.create({
            data: {
                name: payload.name,
                email: payload.email,
                passwordHash: payload.password, // Storing as is, matching existing system
                mobile: payload.mobile,
                otp,
                expiresAt,
            },
        });

        // In a real app, send OTP via SMS/Email here.
        // In a real app, send OTP via SMS/Email here.
        console.log("\n\n=======================================================");
        console.log("🔐🔐🔐 NEW OTP GENERATED 🔐🔐🔐");
        console.log(`👉 EMAIL: ${payload.email}`);
        console.log(`👉 OTP:   ${otp}`);
        console.log("=======================================================\n\n");

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Invalid request" },
            { status: 400 }
        );
    }
}
