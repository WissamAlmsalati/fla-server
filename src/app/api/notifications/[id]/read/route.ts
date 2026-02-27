import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PUT: Mark specific notification as read
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;
        const notificationId = parseInt(id);

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Make sure it belongs to the user, or is global
        if (notification.userId !== null && notification.userId !== user.sub) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Technically we can't easily mark global notifications as "read" per user 
        // without a junction table, but for now we'll allow it on user-owned ones.
        if (notification.userId !== null) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: { read: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
