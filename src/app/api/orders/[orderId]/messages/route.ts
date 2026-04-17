import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sendNotificationToUser } from "@/lib/notifications";
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

    const safeMessages = JSON.parse(JSON.stringify(messages));
    return NextResponse.json({ data: safeMessages });
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

    // Send notification to the order's customer if sender is admin/staff
    try {
      // Get sender details to check role
      const sender = await prisma.user.findUnique({
        where: { id: user.sub },
        select: { role: true, name: true },
      });

      // Get order with customer user details
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
        },
      });

      // Only send notification if sender is admin/staff and order has a customer with a user
      const isStaff = sender?.role && ["ADMIN", "PURCHASE_OFFICER", "CHINA_WAREHOUSE", "LIBYA_WAREHOUSE"].includes(sender.role);
      const customerUser = order?.customer?.user;

      if (isStaff && customerUser) {
        const notificationTitle = "رسالة جديدة";
        const notificationBody = content?.trim() || "صورة";

        // 1. Create database notification for customer
        try {
          await prisma.notification.create({
            data: {
              userId: customerUser.id,
              title: notificationTitle,
              body: notificationBody,
              type: "CHAT_MESSAGE",
              referenceId: Number(orderId),
              firebaseSent: false,
            },
          });
        } catch (dbError) {
          console.error(`Failed to create notification for customer ${customerUser.id}:`, dbError);
        }

        // 2. Send FCM push notification
        const fcmTokens = (customerUser.fcmTokens as string[]) || [];

        if (fcmTokens.length > 0) {
          await sendNotificationToUser(
            fcmTokens,
            notificationTitle,
            notificationBody,
            {
              type: "CHAT_MESSAGE",
              orderId: orderId.toString(),
              messageId: message.id.toString(),
            },
            customerUser.id
          );

          console.log(`Notification sent to customer ${customerUser.id} for order ${orderId}`);
        }
      }

      // Send notification to ALL admins when CUSTOMER sends a message
      const isCustomer = sender?.role === "CUSTOMER";

      if (isCustomer) {
        // Get all admin/staff users
        const admins = await prisma.user.findMany({
          where: {
            role: {
              in: ["ADMIN", "PURCHASE_OFFICER", "CHINA_WAREHOUSE", "LIBYA_WAREHOUSE"],
            },
          },
          select: { id: true, fcmTokens: true },
        });

        const notificationTitle = "رسالة جديدة من عميل";
        const notificationBody = `طلب #${orderId}: ${content?.trim() || "صورة"}`;

        // 1. Create database notifications for each admin
        for (const admin of admins) {
          try {
            await prisma.notification.create({
              data: {
                userId: admin.id,
                title: notificationTitle,
                body: notificationBody,
                type: "CHAT_MESSAGE",
                referenceId: Number(orderId),
                firebaseSent: false, // Will update after FCM attempt
              },
            });
          } catch (dbError) {
            console.error(`Failed to create notification for admin ${admin.id}:`, dbError);
          }
        }

        // 2. Collect all admin FCM tokens
        const adminTokens: { token: string; userId: number }[] = [];
        for (const admin of admins) {
          const tokens = (admin.fcmTokens as string[]) || [];
          for (const token of tokens) {
            adminTokens.push({ token, userId: admin.id });
          }
        }

        // 3. Send FCM push notifications
        if (adminTokens.length > 0) {
          for (const { token, userId } of adminTokens) {
            await sendNotificationToUser(
              [token],
              notificationTitle,
              notificationBody,
              {
                type: "CHAT_MESSAGE_ADMIN",
                orderId: orderId.toString(),
                messageId: message.id.toString(),
              },
              userId
            );
          }

          console.log(`Notification sent to ${adminTokens.length} admin tokens for order ${orderId}`);
        }

        console.log(`Created DB notifications for ${admins.length} admins for order ${orderId}`);
      }
    } catch (notifyError) {
      // Don't fail the request if notification fails
      console.error("Failed to send notification:", notifyError);
    }

    // Bypass Next.js internal JSON serialization bug with Prisma objects
    const safeMessage = JSON.parse(JSON.stringify(message));
    return NextResponse.json({ data: safeMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
