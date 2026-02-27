import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const profileUpdateSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    location: z.string().optional(),
});

export async function PUT(request: Request) {
    try {
        const payload = await requireAuth(request);

        if (!payload?.sub) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const userId = typeof payload.sub === 'string' ? parseInt(payload.sub as string) : (payload.sub as number);
        const body = await request.json();
        const data = profileUpdateSchema.parse(body);

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                ...(data.location !== undefined && { location: data.location }),
            },
            include: { customer: true }
        });

        return NextResponse.json({
            message: "تم تحديث الملف الشخصي بنجاح",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                location: updatedUser.location,
                customerId: updatedUser.customerId,
                code: updatedUser.customer?.code,
                dubaiCode: updatedUser.customer?.dubaiCode,
                usaCode: updatedUser.customer?.usaCode,
                turkeyCode: updatedUser.customer?.turkeyCode,
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "حدث خطأ أثناء تحديث الملف الشخصي" }, { status: 500 });
    }
}
