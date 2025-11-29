import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const user = await requireAuth(request);
        const { orderId } = await params;

        const unreadCount = await prisma.orderMessage.count({
            where: {
                orderId: Number(orderId),
                authorId: { not: user.sub },
                readBy: { hasEvery: [user.sub] },
            },
        });

        return NextResponse.json({ unreadCount });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
    }
}
