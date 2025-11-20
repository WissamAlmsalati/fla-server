import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const shipments = await prisma.shipment.findMany({
      include: {
        items: {
          include: {
            order: true,
          },
        },
        fromWarehouse: true,
        toWarehouse: true,
      },
    });
    return NextResponse.json({ data: shipments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
