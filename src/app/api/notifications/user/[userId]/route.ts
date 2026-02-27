import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: Admin fetches a specific user's notification history
export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const auth = await requireAuth(request);
        if (auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { userId } = await params;
        const userIdNum = parseInt(userId);
        if (isNaN(userIdNum)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const skip = parseInt(url.searchParams.get('skip') || '0');

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: userIdNum },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
            }),
            prisma.notification.count({
                where: { userId: userIdNum },
            }),
        ]);

        return NextResponse.json({ notifications, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
