import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  content: z.string().min(1),
});

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    await requireAuth(request);
    const messages = await prisma.orderMessage.findMany({
      where: { orderId: Number(params.orderId) },
      orderBy: { createdAt: "asc" },
      include: { author: true },
    });
    return NextResponse.json({ data: messages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const user = await requireAuth(request);
    const body = bodySchema.parse(await request.json());
    const message = await prisma.orderMessage.create({
      data: {
        content: body.content,
        orderId: Number(params.orderId),
        authorId: user.sub,
      },
    });
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
