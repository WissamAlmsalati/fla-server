import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const createRateSchema = z.object({
  type: z.enum(["AIR", "SEA"]),
  name: z.string().min(1),
  price: z.number().min(0),
  country: z.string().default("CHINA"),
});

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ];
    }

    const rates = await prisma.shippingRate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rates);
  } catch (error) {
    console.error("Error fetching rates:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const payload = createRateSchema.parse(body);

    const rate = await prisma.shippingRate.create({
      data: payload,
    });

    return NextResponse.json(rate);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating rate" },
      { status: 500 }
    );
  }
}
