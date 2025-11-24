import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateRateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  country: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const rateId = parseInt(id);
    const body = await request.json();
    const payload = updateRateSchema.parse(body);

    const rate = await prisma.shippingRate.update({
      where: { id: rateId },
      data: payload,
    });

    return NextResponse.json(rate);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating rate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const rateId = parseInt(id);

    await prisma.shippingRate.delete({
      where: { id: rateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting rate" },
      { status: 500 }
    );
  }
}
