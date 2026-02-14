import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const bodySchema = z.object({
  content: z.string().min(1),
});

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    const messages = await prisma.orderMessage.findMany({
      where: { orderId: Number(orderId) },
      orderBy: { createdAt: "asc" },
      include: {
        author: true,
        replyTo: {
          include: {
            author: true
          }
        }
      },
    });

    // Mark messages as read by current user
    const unreadMessageIds = messages
      .filter((msg: any) => !msg.readBy.includes(user.sub) && msg.authorId !== user.sub)
      .map((msg: any) => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.orderMessage.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: {
          readBy: {
            push: user.sub,
          },
        },
      });
    }

    return NextResponse.json({ data: messages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;

    const formData = await request.formData();
    const content = formData.get("content") as string;
    const file = formData.get("image") as File | null;
    const replyToId = formData.get("replyToId") ? Number(formData.get("replyToId")) : undefined;

    console.log("POST message request:", { orderId, content, file: file ? { name: file.name, size: file.size, type: file.type } : null, replyToId });

    // Content is required only if no image is provided
    if ((!content || content.trim().length === 0) && (!file || file.size === 0)) {
      console.log("Validation failed: No content and no image");
      return NextResponse.json({ error: "Content or image is required" }, { status: 400 });
    }

    let imageUrl: string | null = null;

    // Handle image upload if present
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
        const filename = `${uniqueSuffix}-${originalName}`;

        const uploadDir = join(process.cwd(), "public/uploads/messages");

        console.log("Saving image to:", uploadDir, filename);

        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {
          // Ignore if exists
        }

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        imageUrl = `/uploads/messages/${filename}`;
        console.log("Image saved, url:", imageUrl);
      } catch (uploadError) {
        console.error("Error saving image:", uploadError);
        return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
      }
    }

    const message = await prisma.orderMessage.create({
      data: {
        content: content?.trim() || "",
        imageUrl,
        orderId: Number(orderId),
        authorId: user.sub,
        readBy: [user.sub], // Author has read their own message
        replyToId: replyToId,
      },
      include: {
        author: true,
        replyTo: {
          include: {
            author: true
          }
        }
      },
    });

    console.log("Message created:", message.id);
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
