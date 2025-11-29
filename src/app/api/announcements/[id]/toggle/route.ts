import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

enum Role {
    ADMIN = "ADMIN",
    PURCHASE_OFFICER = "PURCHASE_OFFICER",
    CHINA_WAREHOUSE = "CHINA_WAREHOUSE",
    LIBYA_WAREHOUSE = "LIBYA_WAREHOUSE",
    CUSTOMER = "CUSTOMER",
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Get current announcement
        const currentAnnouncement = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!currentAnnouncement) {
            return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
        }

        // Toggle isActive status
        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                isActive: !currentAnnouncement.isActive,
            },
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Error toggling announcement status:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error toggling announcement status" },
            { status: 400 }
        );
    }
}
