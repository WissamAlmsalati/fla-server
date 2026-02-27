import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendNotificationToUser } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST: Admin creates a notification
export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, body: content, userId, type } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        if (userId) {
            // Store specific user notification in DB
            const notification = await prisma.notification.create({
                data: {
                    title,
                    body: content,
                    userId: parseInt(userId),
                    type: type || 'SYSTEM',
                },
            });

            // Send to specific user
            let sendStatus: any = null;
            let firebaseSent = false;
            const targetUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });

            if (targetUser && targetUser.fcmTokens.length > 0) {
                sendStatus = await sendNotificationToUser(targetUser.fcmTokens, title, content, { type: type || 'SYSTEM', notificationId: String(notification.id) });
                if (sendStatus?.success && !sendStatus?.simulated) {
                    firebaseSent = true;
                }
            } else {
                console.log(`[MOCK NOTIFICATION] To user ${userId}. Reason: No FCM tokens.`);
                sendStatus = { simulated: true, success: true, message: "User has no FCM tokens. Saved to DB only." };
            }

            const updatedNotification = await prisma.notification.update({
                where: { id: notification.id },
                data: { firebaseSent }
            });

            return NextResponse.json({ ...updatedNotification, sendStatus }, { status: 201 });
        } else {
            // Broadcast to all users
            const allUsers = await prisma.user.findMany({ select: { id: true, fcmTokens: true } });

            // 1. Create a log record for the Admin dashboard (userId: null)
            const globalLog = await prisma.notification.create({
                data: {
                    title,
                    body: content,
                    userId: null,
                    type: type || 'SYSTEM',
                },
            });

            // 2. Push via FCM
            let sendStatus: any = null;
            let firebaseSent = false;
            const allTokens = allUsers.flatMap(u => u.fcmTokens);
            if (allTokens.length > 0) {
                sendStatus = await sendNotificationToUser(allTokens, title, content, { type: type || 'SYSTEM', notificationId: String(globalLog.id) });
                if (sendStatus?.success && !sendStatus?.simulated) {
                    firebaseSent = true;
                }
            } else {
                console.log(`[MOCK NOTIFICATION] To everyone. Reason: No FCM tokens found in entire system.`);
                sendStatus = { simulated: true, success: true, message: "No FCM tokens found in system. Saved to DB only." };
            }

            // 3. Update global log with firebaseSent
            const updatedGlobalLog = await prisma.notification.update({
                where: { id: globalLog.id },
                data: { firebaseSent }
            });

            // 4. Create individual records for ALL users so read-receipts work independently
            await prisma.notification.createMany({
                data: allUsers.map(u => ({
                    title,
                    body: content,
                    userId: u.id,
                    type: type || 'SYSTEM',
                    firebaseSent,
                }))
            });

            return NextResponse.json({ ...updatedGlobalLog, sendStatus }, { status: 201 });
        }
    } catch (error: any) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET: User fetches their notifications
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const adminView = url.searchParams.get('admin') === 'true';

        let whereClause: any = { userId: user.sub };

        // If requested by the admin page, show only the global logs and specific sent notifications
        if (adminView && user.role === 'ADMIN') {
            whereClause = {}; // We might filter this better, but for now we'll fetch global logs via the UI
            const notifications = await prisma.notification.findMany({
                where: {
                    OR: [
                        { userId: null }, // Global logs
                    ],
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return NextResponse.json(notifications);
        }

        // Standard user fetch (For the Bell)
        const notifications = await prisma.notification.findMany({
            where: { userId: user.sub },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(notifications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
