import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "@/lib/auth";
import { setUserPresence, getUsersInChat } from "@/lib/presence";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Get token from query params (EventSource doesn't support headers)
        const token = request.nextUrl.searchParams.get("token");
        if (!token) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Verify token
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as unknown as JWTPayload;
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { orderId } = await params;
        const orderIdNum = Number(orderId);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                // Mark user as present
                setUserPresence(payload.sub, orderIdNum);

                // Send initial messages with online users
                const initialMessages = await prisma.orderMessage.findMany({
                    where: { orderId: orderIdNum },
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

                const onlineUsers = getUsersInChat(orderIdNum);

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ messages: initialMessages, onlineUsers })}\n\n`)
                );

                // Poll for new messages and presence every 3 seconds
                const interval = setInterval(async () => {
                    try {
                        // Update presence
                        setUserPresence(payload.sub, orderIdNum);

                        const messages = await prisma.orderMessage.findMany({
                            where: { orderId: orderIdNum },
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

                        const onlineUsers = getUsersInChat(orderIdNum);

                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ messages, onlineUsers })}\n\n`)
                        );
                    } catch (error) {
                        console.error("Error fetching messages:", error);
                    }
                }, 3000);

                // Cleanup on close
                request.signal.addEventListener("abort", () => {
                    clearInterval(interval);
                    controller.close();
                });
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Error" }),
            { status: 400 }
        );
    }
}
