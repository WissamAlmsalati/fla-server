import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

enum Role {
    ADMIN = "ADMIN",
    PURCHASE_OFFICER = "PURCHASE_OFFICER",
    CHINA_WAREHOUSE = "CHINA_WAREHOUSE",
    LIBYA_WAREHOUSE = "LIBYA_WAREHOUSE",
    CUSTOMER = "CUSTOMER",
}

const createAnnouncementSchema = z.object({
    title: z.string().min(1, "Title is required"),
});

export async function GET(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const announcements = await prisma.announcement.findMany({
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

export async function POST(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await request.formData();
        const title = data.get("title") as string;
        const file: File | null = data.get("image") as unknown as File;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (!file) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // Upload image
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

        const imageUrl = `/uploads/${filename}`;

        // Create announcement
        const announcement = await prisma.announcement.create({
            data: {
                title,
                imageUrl,
            },
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Error creating announcement:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error creating announcement" },
            { status: 400 }
        );
    }
}
