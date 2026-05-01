import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
    mobile: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
});

export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);

        const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
        if (!dbUser) {
            return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
        }
        if (dbUser.mobile) {
            return NextResponse.json(
                { error: "رقم الهاتف مضاف بالفعل ولا يمكن تغييره" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { mobile } = schema.parse(body);

        // Check the mobile is not already taken by another user
        const existing = await prisma.user.findFirst({ where: { mobile } });
        if (existing) {
            return NextResponse.json(
                { error: "رقم الهاتف مستخدم بالفعل" },
                { status: 400 }
            );
        }

        // Save mobile directly (no OTP needed)
        const updatedUser = await prisma.user.update({
            where: { id: user.sub },
            data: { mobile },
            include: { customer: true },
        });

        console.log(`[ADD MOBILE] User ${user.sub} added mobile: ${mobile}`);

        return NextResponse.json({
            message: "تم إضافة رقم الهاتف بنجاح",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                customerId: updatedUser.customerId,
                mobile: updatedUser.mobile,
                code: updatedUser.customer?.code,
                dubaiCode: updatedUser.customer?.dubaiCode,
                usaCode: updatedUser.customer?.usaCode,
                turkeyCode: updatedUser.customer?.turkeyCode,
                location: updatedUser.location,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "طلب غير صالح" },
            { status: 400 }
        );
    }
}
