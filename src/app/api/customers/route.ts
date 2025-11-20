import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

enum Role {
  ADMIN = "ADMIN",
  PURCHASE_OFFICER = "PURCHASE_OFFICER",
  CHINA_WAREHOUSE = "CHINA_WAREHOUSE",
  LIBYA_WAREHOUSE = "LIBYA_WAREHOUSE",
  CUSTOMER = "CUSTOMER",
}

const createCustomerSchema = z.object({
  name: z.string().min(2),
  userId: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (![Role.ADMIN, Role.PURCHASE_OFFICER].includes(auth.role as Role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error fetching customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const payload = createCustomerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: {
        name: payload.name,
        userId: payload.userId,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error creating customer" }, { status: 400 });
  }
}
