import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        console.log('💰 WALLET API CALLED');
        console.log('User ID:', user.sub);
        console.log('User Role:', user.role);
        console.log('User customerId from token:', user.customerId);

        // For CUSTOMER users, get their wallet
        if (user.role !== "CUSTOMER") {
            return NextResponse.json(
                { error: "Only customers can access this endpoint" },
                { status: 403 }
            );
        }

        let customerId = user.customerId;

        // If customerId is not in token, fetch it from database
        if (!customerId) {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.sub },
                include: { customer: true }
            });

            if (!dbUser?.customer?.id) {
                return NextResponse.json(
                    { error: "Customer account not found" },
                    { status: 404 }
                );
            }

            customerId = dbUser.customer.id;
        }

        console.log('✅ Fetching wallet for customerId:', customerId);

        // Get customer wallet
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                name: true,
                code: true,
                balanceUSD: true,
                balanceLYD: true,
                balanceCNY: true,
            }
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        const response = {
            data: {
                customerId: customer.id,
                customerName: customer.name,
                customerCode: customer.code,
                wallets: {
                    USD: {
                        currency: "USD",
                        balance: customer.balanceUSD,
                        symbol: "$"
                    },
                    LYD: {
                        currency: "LYD",
                        balance: customer.balanceLYD,
                        symbol: "د.ل"
                    },
                    CNY: {
                        currency: "CNY",
                        balance: customer.balanceCNY,
                        symbol: "¥"
                    }
                }
            }
        };

        console.log('💰 WALLET RESPONSE:', JSON.stringify(response, null, 2));
        console.log('='.repeat(50));

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 400 }
        );
    }
}
