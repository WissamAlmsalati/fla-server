import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
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

        // Create User and Customer
        const user = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: pendingUser.name,
                    email: pendingUser.email,
                    passwordHash: pendingUser.passwordHash,
                    mobile: pendingUser.mobile,
                    role: "CUSTOMER",
                },
            });

            // Generate sequential code logic
            const lastCustomer = await tx.customer.findFirst({
                where: {
                    code: {
                        startsWith: "KO219-FLL"
                    }
                },
                orderBy: {
                    id: "desc"
                }
            });

            let nextCode = "KO219-FLL1";
            let nextDubaiCode = "BSB FLL D1";
            let nextUsaCode = "Global FLL 1";
            let nextTurkeyCode = "ABUHAJ FLL 1";

            if (lastCustomer) {
                const match = lastCustomer.code.match(/KO219-FLL(\d+)/);
                if (match) {
                    const lastNumber = parseInt(match[1]);
                    const nextNumber = lastNumber + 1;
                    nextCode = `KO219-FLL${nextNumber}`;
                    nextDubaiCode = `BSB FLL D${nextNumber}`;
                    nextUsaCode = `Global FLL ${nextNumber}`;
                    nextTurkeyCode = `ABUHAJ FLL ${nextNumber}`;
                }
            }

            // Create Customer
            const newCustomer = await tx.customer.create({
                data: {
                    name: pendingUser.name,
                    userId: newUser.id,
                    code: nextCode,
                    dubaiCode: nextDubaiCode,
                    usaCode: nextUsaCode,
                    turkeyCode: nextTurkeyCode,
                },
            });

            // Update User with customerId
            await tx.user.update({
                where: { id: newUser.id },
                data: { customerId: newCustomer.id },
            });

            return newUser;
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
