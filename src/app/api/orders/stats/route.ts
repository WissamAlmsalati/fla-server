import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        console.log('🔵 STATS API CALLED');
        console.log('User ID:', user.sub);
        console.log('User Role:', user.role);
        console.log('User customerId from token:', user.customerId);

        let where: any = {};

        // For CUSTOMER users, ALWAYS filter by their customerId
        if (user.role === "CUSTOMER") {
            if (user.customerId) {
                where.customerId = user.customerId;
                console.log('✅ Filtering by customerId:', user.customerId);
            } else {
                // If customerId is not in token, fetch it from database
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.sub },
                    include: { customer: true }
                });

                if (dbUser?.customer?.id) {
                    where.customerId = dbUser.customer.id;
                    console.log('✅ Filtering by customerId (from DB):', dbUser.customer.id);
                } else {
                    console.log('❌ CUSTOMER has no customerId - returning empty result');
                    where.customerId = -1; // No orders will match this
                }
            }
        } else {
            console.log('⚠️ User is', user.role, '- Returning ALL orders');
        }
        console.log('Where clause:', JSON.stringify(where, null, 2));


        // Group by status
        const statusStats = await prisma.order.groupBy({
            by: ["status"],
            where,
            _count: {
                id: true,
            },
        });

        // Group by country
        const countryStats = await prisma.order.groupBy({
            by: ["country"],
            where,
            _count: {
                id: true,
            },
        });

        // Get total count
        const totalCount = await prisma.order.count({
            where,
        });

        // Format the response
        const byStatus = statusStats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        const byCountry = countryStats.reduce((acc, curr) => {
            const country = curr.country || "UNKNOWN";
            acc[country] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        const response = {
            data: {
                total: totalCount,
                byStatus,
                byCountry,
            },
        };

        // Debug: Log the response to terminal
        console.log('📊 ORDER STATS API RESPONSE:');
        console.log('User ID:', user.sub);
        console.log('User Role:', user.role);
        console.log('Customer ID:', user.customerId);
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('='.repeat(50));

        return NextResponse.json({
            data: {
                total: totalCount,
                byStatus,
                byCountry,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 400 }
        );
    }
}
