import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Get all pending account requests (unapproved users)
export async function GET(request: Request) {
    try {
        const auth = await requireAuth(request);

        // Only admins can view pending accounts
        if (auth.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const pendingAccounts = await prisma.user.findMany({
            where: {
                approved: false,
                role: "CUSTOMER",
            },
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ accounts: pendingAccounts });
    } catch (error) {
        console.error("Error fetching pending accounts:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch pending accounts" },
            { status: 500 }
        );
    }
}
