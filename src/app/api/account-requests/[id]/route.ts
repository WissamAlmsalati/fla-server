import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH - Approve an account request
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const auth = await requireAuth(request);

        // Only admins can approve accounts
        if (auth.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        // Check if user exists and is pending approval
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.approved) {
            return NextResponse.json(
                { error: "User is already approved" },
                { status: 400 }
            );
        }

        // Approve the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { approved: true },
            include: {
                customer: true,
            },
        });

        return NextResponse.json({
            message: "Account approved successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error approving account:", error);
        return NextResponse.json(
            { error: "Failed to approve account" },
            { status: 500 }
        );
    }
}

// DELETE - Reject/delete an account request
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const auth = await requireAuth(request);

        // Only admins can reject accounts
        if (auth.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        // Check if user exists and is pending approval
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                customer: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.approved) {
            return NextResponse.json(
                { error: "Cannot reject an already approved user" },
                { status: 400 }
            );
        }

        // Delete the user and associated customer in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete customer if exists
            if (user.customerId) {
                await tx.customer.delete({
                    where: { id: user.customerId },
                });
            }

            // Delete user
            await tx.user.delete({
                where: { id: userId },
            });
        });

        return NextResponse.json({
            message: "Account request rejected and deleted successfully",
        });
    } catch (error) {
        console.error("Error rejecting account:", error);
        return NextResponse.json(
            { error: "Failed to reject account" },
            { status: 500 }
        );
    }
}
