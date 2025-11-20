import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderFiltersSchema, createOrderSchema } from "@/lib/validation";
import { parsePaginationMeta } from "@/lib/pagination";
import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const query = orderFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const where = user.role === "Customer" ? { customerId: user.customerId } : {};

    const orders = await prisma.order.findMany({
      where: {
        ...where,
        ...(query.status && { status: query.status }),
        ...(query.customerId && { customerId: query.customerId }),
      },
      take: query.limit,
      cursor: query.cursor ? { id: Number(query.cursor) } : undefined,
      orderBy: { id: "desc" },
      include: { customer: true },
    });

    return NextResponse.json({
      data: orders,
      meta: parsePaginationMeta(orders, query.limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user.role, ["Admin", "PurchaseOfficer"]);
    const body = createOrderSchema.parse(await request.json());
    const order = await prisma.order.create({
      data: {
        trackingNumber: body.tracking_number,
        name: body.name,
        usdPrice: body.usd_price,
        cnyPrice: body.cny_price,
        productUrl: body.product_url,
        notes: body.notes,
        weight: body.weight,
        customerId: body.customer_id,
      },
    });
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create order" },
      { status: 400 },
    );
  }
}
