import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

enum Role {
  ADMIN = "ADMIN",
  PURCHASE_OFFICER = "PURCHASE_OFFICER",
  CHINA_WAREHOUSE = "CHINA_WAREHOUSE",
  LIBYA_WAREHOUSE = "LIBYA_WAREHOUSE",
  CUSTOMER = "CUSTOMER",
}

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
  mobile: z.string().optional(),
  photoUrl: z.string().optional(),
  passportUrl: z.string().optional(),
  customerCode: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mobile: true,
        photoUrl: true,
        passportUrl: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            code: true,
            balanceUSD: true,
            balanceLYD: true,
            balanceCNY: true
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const payload = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is being updated, check for uniqueness
    if (payload.email && payload.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: payload.name,
          email: payload.email,
          passwordHash: payload.password, // In real app, hash this if provided
          role: payload.role,
          mobile: payload.mobile,
          photoUrl: payload.photoUrl,
          passportUrl: payload.passportUrl,
        },
      });

      // If role is CUSTOMER, ensure customer record exists
      if (payload.role === Role.CUSTOMER) {
        const customerExists = await tx.customer.findUnique({
          where: { userId: user.id },
        });

        if (!customerExists) {
          const random = Math.floor(1000 + Math.random() * 9000);
          const shippingCode = `LY-${random}`;
          
          await tx.customer.create({
            data: {
              name: user.name,
              userId: user.id,
              code: shippingCode,
            },
          });
        }
      }

      if (payload.customerCode) {
        const customer = await tx.customer.findUnique({ where: { userId: userId } });
        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { code: payload.customerCode }
          });
        }
      }

      return user;
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating user" },
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
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting self
    if (existingUser.id === auth.sub) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting user" },
      { status: 500 }
    );
  }
}
