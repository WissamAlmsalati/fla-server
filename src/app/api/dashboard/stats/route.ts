import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        // Get total users count (admin only)
        const totalUsers = user.role === "ADMIN"
            ? await prisma.user.count()
            : 0;

        // Get total warehouses count
        const totalWarehouses = await prisma.warehouse.count();

        // Get order statistics
        const orderStats = await prisma.order.groupBy({
            by: ["status"],
            _count: {
                id: true,
            },
        });

        const totalOrders = await prisma.order.count();

        // Get orders by country
        const ordersByCountry = await prisma.order.groupBy({
            by: ["country"],
            _count: {
                id: true,
            },
        });

        // Get recent orders trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const ordersLast30Days = await prisma.order.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });

        // Calculate growth percentage (mock for now)
        const previousPeriodOrders = totalOrders - ordersLast30Days;
        const growthPercentage = previousPeriodOrders > 0
            ? ((ordersLast30Days - previousPeriodOrders) / previousPeriodOrders * 100).toFixed(1)
            : "0";

        // Format status stats
        const byStatus = orderStats.reduce((acc: Record<string, number>, curr: any) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        // Format country stats
        const byCountry = ordersByCountry.reduce((acc: Record<string, number>, curr: any) => {
            const country = curr.country || "UNKNOWN";
            acc[country] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        // Get order trend data (last 7 days)
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await prisma.order.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate,
                    },
                },
            });

            trendData.push({
                date: date.toISOString().split('T')[0],
                count,
            });
        }

        return NextResponse.json({
            data: {
                totalOrders,
                totalUsers,
                totalWarehouses,
                ordersLast30Days,
                growthPercentage: parseFloat(growthPercentage),
                byStatus,
                byCountry,
                trendData,
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 400 }
        );
    }
}
