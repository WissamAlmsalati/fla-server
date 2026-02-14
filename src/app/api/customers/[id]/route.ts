import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

enum Role {
  ADMIN = "ADMIN",
  PURCHASE_OFFICER = "PURCHASE_OFFICER",
}

const updateCustomerSchema = z.object({
  balanceUSD: z.number().optional(),
  balanceLYD: z.number().optional(),
  balanceCNY: z.number().optional(),
  code: z.string().optional(),
  dubaiCode: z.string().optional(),
  usaCode: z.string().optional(),
  turkeyCode: z.string().optional(),
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const customerId = parseInt(id);

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Use a transaction to update orders and delete customer
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Set customerId to null for all orders (using raw SQL since Prisma client may not be updated)
      await tx.$executeRaw`UPDATE "Order" SET "customerId" = NULL WHERE "customerId" = ${customerId}`;

      // Now delete the customer
      await tx.customer.delete({
        where: { id: customerId },
      });
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting customer" },
      { status: 400 }
    );
  }
}
