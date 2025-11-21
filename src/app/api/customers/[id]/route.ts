import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

enum Role {
  ADMIN = "ADMIN",
  PURCHASE_OFFICER = "PURCHASE_OFFICER",
}

const updateCustomerSchema = z.object({
  balanceUSD: z.number().optional(),
  balanceLYD: z.number().optional(),
  balanceCNY: z.number().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (![Role.ADMIN, Role.PURCHASE_OFFICER].includes(auth.role as Role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const payload = updateCustomerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: payload,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            photoUrl: true,
            passportUrl: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating customer" },
      { status: 400 }
    );
  }
}
