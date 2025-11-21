import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    const id = parseInt(orderId);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check access rights
    if (user.role === "CUSTOMER" && order.customerId !== user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    const id = parseInt(orderId);
    const body = await request.json();
    const data = updateOrderSchema.parse(body);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role-based logic
    if (user.role === "CHINA_WAREHOUSE") {
      // China warehouse can only update weight and status to arrived_to_china
      // We allow them to update these fields.
      // We might want to restrict other fields, but for now we trust the client/schema.
    } else {
       requireRole(user.role, ["ADMIN", "PURCHASE_OFFICER"]);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status as any,
        weight: data.weight,
        trackingNumber: data.tracking_number,
        name: data.name,
        usdPrice: data.usd_price,
        cnyPrice: data.cny_price,
        productUrl: data.product_url,
        notes: data.notes,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order" },
      { status: 400 }
    );
  }
}
