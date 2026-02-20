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
  dubaiCode: z.string().optional(),
  usaCode: z.string().optional(),
  turkeyCode: z.string().optional(),
  suspended: z.boolean().optional(),
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
        suspended: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            code: true,
            dubaiCode: true,
            usaCode: true,
            turkeyCode: true,
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
      const updateData: any = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.email !== undefined) updateData.email = payload.email;
      if (payload.role !== undefined) updateData.role = payload.role;
      if (payload.mobile !== undefined) updateData.mobile = payload.mobile;
      if (payload.photoUrl !== undefined) updateData.photoUrl = payload.photoUrl;
      if (payload.passportUrl !== undefined) updateData.passportUrl = payload.passportUrl;
      if (payload.suspended !== undefined) updateData.suspended = payload.suspended;

      // Only update password if provided
      if (payload.password) {
        updateData.passwordHash = payload.password; // In real app, hash this
      }

      const user = await tx.user.update({
        where: { id: userId },
        data: updateData,
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

      // Update customer codes if provided
      const codesToUpdate: any = {};
      if (payload.customerCode !== undefined) codesToUpdate.code = payload.customerCode;
      if (payload.dubaiCode !== undefined) codesToUpdate.dubaiCode = payload.dubaiCode;
      if (payload.usaCode !== undefined) codesToUpdate.usaCode = payload.usaCode;
      if (payload.turkeyCode !== undefined) codesToUpdate.turkeyCode = payload.turkeyCode;

      if (Object.keys(codesToUpdate).length > 0) {
        const customer = await tx.customer.findUnique({ where: { userId: userId } });
        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: codesToUpdate
          });
        }
      }

      return user;
    });

    // Return only the necessary fields, not the password hash
    const { passwordHash, ...userResponse } = updatedUser;
    return NextResponse.json(userResponse);
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
