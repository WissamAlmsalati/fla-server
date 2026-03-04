import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

enum Role {
    ADMIN = "ADMIN",
    PURCHASE_OFFICER = "PURCHASE_OFFICER",
    CHINA_WAREHOUSE = "CHINA_WAREHOUSE",
    LIBYA_WAREHOUSE = "LIBYA_WAREHOUSE",
    CUSTOMER = "CUSTOMER",
}

const importUserSchema = z.object({
    name: z.string().min(2),
    mobile: z.string().min(1),
    email: z.string().email().optional(),
    location: z.string().optional(),
});

const bulkImportSchema = z.array(importUserSchema);

export async function POST(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const payload = bulkImportSchema.parse(body);

        if (payload.length === 0) {
            return NextResponse.json({ error: "No users provided" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Find the last generated customer code to continue the sequence
            const lastCustomer = await tx.customer.findFirst({
                where: {
                    code: {
                        startsWith: "KO219-FLL",
                    },
                },
                orderBy: {
                    id: "desc",
                },
            });

            let nextNumber = 1;
            if (lastCustomer) {
                const match = lastCustomer.code.match(/KO219-FLL(\d+)/);
                if (match) {
                    nextNumber = parseInt(match[1]) + 1;
                }
            }

            const importedUsers = [];

            for (const row of payload) {
                // Skip rows that don't pass minimal validation (already checked by zod but good for safety)
                if (!row.name || !row.mobile) continue;

                // Ensure we don't have duplicate emails if emails are optionally provided
                if (row.email) {
                    const existingEmail = await tx.user.findUnique({
                        where: { email: row.email },
                    });
                    if (existingEmail) continue; // Skip duplicates silently or handle them as needed
                }

                // The password for imported users will be their mobile number by default
                const passwordHash = row.mobile;

                const shippingCode = `KO219-FLL${nextNumber}`;
                const dubaiCode = `BSB FLL D${nextNumber}`;
                const usaCode = `Global FLL ${nextNumber}`;
                const turkeyCode = `ABUHAJ FLL${nextNumber}`;

                const newUser = await tx.user.create({
                    data: {
                        name: row.name,
                        email: row.email ? row.email : null as any,
                        passwordHash: passwordHash, // Auto-use mobile as password
                        role: Role.CUSTOMER,
                        mobile: row.mobile,
                        location: row.location ? row.location : null as any,
                    },
                });

                await tx.customer.create({
                    data: {
                        name: newUser.name,
                        userId: newUser.id,
                        code: shippingCode,
                        dubaiCode,
                        usaCode,
                        turkeyCode,
                    },
                });

                importedUsers.push(newUser);
                nextNumber++;
            }

            return importedUsers;
        });

        return NextResponse.json({
            success: true,
            count: result.length,
            message: `تم استيراد ${result.length} مستخدم بنجاح`,
        });
    } catch (error) {
        console.error("Bulk import error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error importing users" },
            { status: 400 }
        );
    }
}
