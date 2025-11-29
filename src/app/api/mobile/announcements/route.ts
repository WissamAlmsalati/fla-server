import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                imageUrl: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(announcements);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error fetching announcements" },
            { status: 500 }
        );
    }
}
