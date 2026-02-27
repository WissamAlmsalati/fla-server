import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PUT: Mark all notifications as read for current user
export async function PUT(request: Request) {
    try {
        const user = await requireAuth(request);

        await prisma.notification.updateMany({
            where: {
                userId: user.sub,
                read: false,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
