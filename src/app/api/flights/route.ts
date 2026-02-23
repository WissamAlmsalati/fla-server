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

const createFlightSchema = z.object({
    flightNumber: z.string().min(1, "رقم الرحلة مطلوب"),
    status: z.string().optional().default("pending"),
    departureDate: z.string().optional().nullable(),
    arrivalDate: z.string().optional().nullable(),
    country: z.string().optional().default("CHINA"),
});

export async function GET(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        const where: any = {};
        if (search) {
            where.flightNumber = { contains: search, mode: "insensitive" };
        }

        const flights = await prisma.flight.findMany({
            where,
            include: {
                _count: {
                    select: { orders: true },
                },
            },
            orderBy: { id: "desc" },
        });

        return NextResponse.json(flights);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error fetching flights" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN && auth.role !== Role.CHINA_WAREHOUSE && auth.role !== Role.LIBYA_WAREHOUSE) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const payload = createFlightSchema.parse(body);

        const flightInfo = {
            flightNumber: payload.flightNumber,
            status: payload.status,
            country: payload.country,
            departureDate: payload.departureDate ? new Date(payload.departureDate) : null,
            arrivalDate: payload.arrivalDate ? new Date(payload.arrivalDate) : null,
        };

        const flight = await prisma.flight.create({
            data: flightInfo,
        });

        return NextResponse.json(flight);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "رقم الرحلة موجود مسبقاً" }, { status: 400 });
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error creating flight" },
            { status: 400 }
        );
    }
}
