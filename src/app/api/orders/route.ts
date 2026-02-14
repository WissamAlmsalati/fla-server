import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderFiltersSchema, createOrderSchema } from "@/lib/validation";
import { parsePaginationMeta } from "@/lib/pagination";
import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { OrderStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const query = orderFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    const where: any = {};

    // For CUSTOMER users, ALWAYS filter by their customerId
    if (user.role === "CUSTOMER") {
      let customerIdToUse: number | null = user.customerId || null;

      // If customerId not in token, fetch it from database
      if (!customerIdToUse) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.sub },
          include: { customer: true }
        });
        customerIdToUse = dbUser?.customer?.id || null;
      }

      if (!customerIdToUse) {
        // Customer has no associated customer record - return empty
        return NextResponse.json({
          data: [],
          meta: { nextCursor: null, hasMore: false },
        });
      }

      // FORCE customerId filter for customers - they can ONLY see their own orders
      where.customerId = customerIdToUse;
    }

    if (query.search) {
      // First, try to find an exact match for tracking number
      const exactMatch = await prisma.order.findUnique({
        where: { trackingNumber: query.search },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
          shippingRate: true,
        },
      });

      if (exactMatch) {
        // If exact match found, return only that (respecting user permissions)
        if (user.role !== "CUSTOMER" || exactMatch.customerId === user.customerId) {
          const unreadCount = await prisma.orderMessage.count({
            where: {
              orderId: exactMatch.id,
              authorId: { not: user.sub },
              NOT: {
                readBy: {
                  has: user.sub,
                },
              },
            },
          });

          return NextResponse.json({
            data: [{ ...exactMatch, unreadCount }],
            meta: parsePaginationMeta([exactMatch], query.limit),
          });
        }
      }

      where.OR = [
        { trackingNumber: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
              { user: { name: { contains: query.search, mode: "insensitive" } } },
            ],
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where: {
        ...where,
        ...(query.status && { status: query.status as OrderStatus }),
        // Only allow admins/staff to filter by customerId - customers already have it forced
        ...(query.customerId && user.role !== "CUSTOMER" && { customerId: query.customerId }),
        ...(query.country && { country: query.country }),
      },
      take: query.limit,
      cursor: query.cursor ? { id: Number(query.cursor) } : undefined,
      orderBy: { id: "desc" },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        shippingRate: true,
      },
    });

    // Calculate unread message counts for each order
    const ordersWithUnreadCounts = await Promise.all(
      orders.map(async (order: any) => {
        const unreadCount = await prisma.orderMessage.count({
          where: {
            orderId: order.id,
            authorId: { not: user.sub },
            NOT: {
              readBy: {
                has: user.sub,
              },
            },
          },
        });

        return {
          ...order,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      data: ordersWithUnreadCounts,
      meta: parsePaginationMeta(orders, query.limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user.role, ["ADMIN", "PURCHASE_OFFICER"]);
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
        country: body.country,
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
