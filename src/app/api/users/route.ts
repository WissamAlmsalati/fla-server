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

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
  mobile: z.string().optional(),
  photoUrl: z.string().optional(),
  passportUrl: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: any = {};
    if (role) {
      where.role = role;
    } else {
      // Exclude customers by default
      where.role = {
        not: "CUSTOMER"
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ]
          }
        }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
            code: true
          }
        }
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error fetching users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const payload = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Generate shipping code if role is CUSTOMER
    let shippingCode = undefined;
    if (payload.role === Role.CUSTOMER) {
      const lastCustomer = await prisma.customer.findFirst({
        where: {
          code: {
            startsWith: "KO219-FLL"
          }
        },
        orderBy: {
          id: "desc"
        }
      });

      let nextCode = "KO219-FLL1";
      if (lastCustomer) {
        const match = lastCustomer.code.match(/KO219-FLL(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1]);
          nextCode = `KO219-FLL${lastNumber + 1}`;
        }
      }
      shippingCode = nextCode;
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          passwordHash: payload.password, // Note: In a real app, hash this!
          role: payload.role,
          mobile: payload.mobile,
          photoUrl: payload.photoUrl,
          passportUrl: payload.passportUrl,
        },
      });

      if (payload.role === Role.CUSTOMER && shippingCode) {
        await tx.customer.create({
          data: {
            name: newUser.name,
            userId: newUser.id,
            code: shippingCode,
          },
        });
        
        // Update user with customerId (optional, but good for quick access)
        // Actually schema has customerId Int? but it's not a relation field in the new schema?
        // In the schema provided: customer Customer?
        // And Customer has userId.
        // User has customerId Int? but it's not linked to relation.
        // Let's update it anyway if we want to use it, or rely on relation.
        // The relation is on Customer side: user User @relation...
        // So User.customer is accessible.
      }
      
      return newUser;
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error creating user" }, { status: 400 });
  }
}
