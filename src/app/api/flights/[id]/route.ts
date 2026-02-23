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

const updateFlightSchema = z.object({
    flightNumber: z.string().min(1, "رقم الرحلة مطلوب").optional(),
    status: z.string().optional(),
    departureDate: z.string().optional().nullable(),
    arrivalDate: z.string().optional().nullable(),
    country: z.string().optional(),
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await requireAuth(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const flight = await prisma.flight.findUnique({
            where: { id: parseInt(id) },
            include: {
                orders: {
                    include: {
                        customer: true,
                    }
                },
            },
        });

        if (!flight) {
            return NextResponse.json({ error: "Flight not found" }, { status: 404 });
        }

        return NextResponse.json(flight);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching flight" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN && auth.role !== Role.CHINA_WAREHOUSE && auth.role !== Role.LIBYA_WAREHOUSE) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const payload = updateFlightSchema.parse(body);

        const updateData: any = {};
        if (payload.flightNumber !== undefined) updateData.flightNumber = payload.flightNumber;
        if (payload.status !== undefined) updateData.status = payload.status;
        if (payload.country !== undefined) updateData.country = payload.country;
        if (payload.departureDate !== undefined) updateData.departureDate = payload.departureDate ? new Date(payload.departureDate) : null;
        if (payload.arrivalDate !== undefined) updateData.arrivalDate = payload.arrivalDate ? new Date(payload.arrivalDate) : null;

        const flight = await prisma.flight.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(flight);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "رقم الرحلة موجود مسبقاً" }, { status: 400 });
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error updating flight" },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await requireAuth(request);
        if (auth.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.flight.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting flight" },
            { status: 500 }
        );
    }
}
