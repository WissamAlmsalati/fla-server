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

        // Helper maps for labels
        const statusLabels: Record<string, string> = {
            purchased: "تم الشراء",
            arrived_to_china: "وصل إلى المخزن",
            shipping_to_libya: "قيد الشحن لليبيا",
            arrived_libya: "وصل إلى ليبيا",
            ready_for_pickup: "جاهز للتسليم",
            delivered: "تم التسليم",
            canceled: "ملغي",
        };

        const countryLabels: Record<string, string> = {
            CHINA: "الصين",
            USA: "أمريكا",
            TURKEY: "تركيا",
            DUBAI: "دبي",
            UNKNOWN: "غير محدد",
        };

        // Format the response
        const byStatus = statusStats.reduce((acc: Record<string, number>, curr: any) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        const byCountry = countryStats.reduce((acc: Record<string, number>, curr: any) => {
            const country = curr.country || "UNKNOWN";
            acc[country] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        // Create structured lists for Flutter
        const statusList = Object.entries(byStatus).map(([id, count]) => ({
            id,
            label: statusLabels[id] || id,
            count
        }));

        const countryList = Object.entries(byCountry).map(([id, count]) => ({
            id,
            label: countryLabels[id] || id,
            count
        }));

        const response = {
            data: {
                total: totalCount,
                byStatus,
                byCountry,
                statusList,
                countryList,
            },
        };

        // Debug: Log the response to terminal
        console.log('📊 ORDER STATS API RESPONSE:');
        console.log('User ID:', user.sub);
        console.log('User Role:', user.role);
        console.log('Customer ID:', user.customerId);
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('='.repeat(50));

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 400 }
        );
    }
}
