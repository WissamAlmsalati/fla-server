import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

enum Role {
    ADMIN = "ADMIN",
    PURCHASE_OFFICER = "PURCHASE_OFFICER",
    CHINA_WAREHOUSE = "CHINA_WAREHOUSE",
    LIBYA_WAREHOUSE = "LIBYA_WAREHOUSE",
    CUSTOMER = "CUSTOMER",
}

const updateAnnouncementSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
});

export async function PUT(
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

        const data = await request.formData();
        const title = data.get("title") as string | null;
        const file: File | null = data.get("image") as unknown as File;

        const updateData: any = {};

        if (title) {
            updateData.title = title;
        }

        if (file) {
            // Get old announcement to delete old image
            const oldAnnouncement = await prisma.announcement.findUnique({
                where: { id },
            });

            if (!oldAnnouncement) {
                return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
            }

            // Upload new image
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
            const filename = `${uniqueSuffix}-${originalName}`;

            const uploadDir = join(process.cwd(), "public/uploads");

            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {
                // Ignore if exists
            }

            const path = join(uploadDir, filename);
            await writeFile(path, buffer);

            updateData.imageUrl = `/uploads/${filename}`;

            // Delete old image
            if (oldAnnouncement.imageUrl) {
                try {
                    const oldPath = join(process.cwd(), "public", oldAnnouncement.imageUrl);
                    await unlink(oldPath);
                } catch (e) {
                    // Ignore if file doesn't exist
                    console.error("Error deleting old image:", e);
                }
            }
        }

        const announcement = await prisma.announcement.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Error updating announcement:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error updating announcement" },
            { status: 400 }
        );
    }
}

export async function DELETE(
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

        // Get announcement to delete image
        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) {
            return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
        }

        // Delete from database
        await prisma.announcement.delete({
            where: { id },
        });

        // Delete image file
        if (announcement.imageUrl) {
            try {
                const imagePath = join(process.cwd(), "public", announcement.imageUrl);
                await unlink(imagePath);
            } catch (e) {
                // Ignore if file doesn't exist
                console.error("Error deleting image:", e);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error deleting announcement" },
            { status: 400 }
        );
    }
}
