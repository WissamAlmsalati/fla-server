import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
    try {
        const decoded = await requireAuth(request);

        const body = await request.json();
        const { customerId, type, amount, currency, notes } = body;

        // Validation
        if (!customerId || !type || !amount || !currency) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be greater than 0" },
                { status: 400 }
            );
        }

        if (!["DEPOSIT", "WITHDRAWAL"].includes(type)) {
            return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
        }

        if (!["USD", "LYD", "CNY"].includes(currency)) {
            return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
        }

        // Get customer
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Get current balance based on currency
        let balanceBefore: number;
        let balanceAfter: number;

        switch (currency) {
            case "USD":
                balanceBefore = customer.balanceUSD;
                break;
            case "LYD":
                balanceBefore = customer.balanceLYD;
                break;
            case "CNY":
                balanceBefore = customer.balanceCNY;
                break;
            default:
                return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
        }

        // Calculate new balance
        if (type === "DEPOSIT") {
            balanceAfter = balanceBefore + amount;
        } else {
            // WITHDRAWAL
            if (balanceBefore < amount) {
                return NextResponse.json(
                    { error: "Insufficient balance" },
                    { status: 400 }
                );
            }
            balanceAfter = balanceBefore - amount;
        }

        // Create transaction and update balance in a transaction
        const transactionResult = await prisma.$transaction(async (tx) => {
            // Create transaction record
            const newTransaction = await tx.transaction.create({
                data: {
                    customerId,
                    type,
                    amount,
                    currency,
                    balanceBefore,
                    balanceAfter,
                    notes,
                    createdBy: decoded.sub,
                },
            });

            // Update customer balance
            const updateData: any = {};
            switch (currency) {
                case "USD":
                    updateData.balanceUSD = balanceAfter;
                    break;
                case "LYD":
                    updateData.balanceLYD = balanceAfter;
                    break;
                case "CNY":
                    updateData.balanceCNY = balanceAfter;
                    break;
            }

            await tx.customer.update({
                where: { id: customerId },
                data: updateData,
            });

            return newTransaction;
        });

        return NextResponse.json(transactionResult, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET /api/transactions - Get transactions with filters
export async function GET(request: NextRequest) {
    try {
        await requireAuth(request);

        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");
        const currency = searchParams.get("currency");
        const type = searchParams.get("type");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!customerId) {
            return NextResponse.json(
                { error: "customerId is required" },
                { status: 400 }
            );
        }

        // Build where clause
        const where: any = {
            customerId: parseInt(customerId),
        };

        if (currency) {
            where.currency = currency;
        }

        if (type) {
            where.type = type;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const search = searchParams.get("search");
        if (search) {
            where.notes = { contains: search, mode: "insensitive" };
        }

        // Fetch transactions
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
