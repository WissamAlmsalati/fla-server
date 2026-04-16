import { firebaseAdmin } from './firebase';
import { prisma } from './prisma';

// FCM error codes that indicate the token is invalid and should be removed
const INVALID_TOKEN_ERRORS = [
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
    'messaging/mismatched-credential',
];

export async function sendNotificationToUser(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
    userId?: number
) {
    if (!firebaseAdmin || !firebaseAdmin.apps?.length || fcmTokens.length === 0) {
        console.log(`[MOCK NOTIFICATION] To ${fcmTokens.length} tokens. Title: ${title}`);
        return {
            simulated: true,
            success: true,
            message: !fcmTokens.length ? "No tokens provided" : "Firebase not initialized. Simulated push."
        };
    }

    const invalidTokens: string[] = [];

    try {
        const responses = [];
        let successCount = 0;
        let failureCount = 0;

        for (const token of fcmTokens) {
            try {
                const singleMessage = {
                    notification: {
                        title,
                        body,
                    },
                    data,
                    android: {
                        notification: {
                            channelId: 'high_importance_channel',
                            sound: 'notification_sound',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'notification_sound.caf',
                            },
                        },
                    },
                    token,
                };
                const messageId = await firebaseAdmin.messaging().send(singleMessage);
                responses.push({ success: true, messageId });
                successCount++;
            } catch (err: any) {
                const errorCode = err.code || 'unknown';
                responses.push({ success: false, error: err.message, code: errorCode });
                failureCount++;
                console.warn(`Failed to send notification to token ${token.substring(0, 10)}...: ${errorCode} - ${err.message}`);

                // Track invalid tokens for cleanup
                if (INVALID_TOKEN_ERRORS.includes(errorCode)) {
                    invalidTokens.push(token);
                }
            }
        }

        // Clean up invalid tokens from the database
        if (invalidTokens.length > 0 && userId) {
            await removeInvalidTokens(userId, invalidTokens);
        }

        const response = {
            responses,
            successCount,
            failureCount,
            invalidTokensRemoved: invalidTokens.length,
        };

        // Consider it a success if at least one notification was sent successfully
        // OR if there were no failures (though this case shouldn't happen if fcmTokens.length > 0)
        const overallSuccess = successCount > 0 || failureCount === 0;

        return { simulated: false, success: overallSuccess, response };
    } catch (error: any) {
        console.error('Critical error in sendNotificationToUser:', error);
        return { simulated: false, success: false, error: error.message };
    }
}

async function removeInvalidTokens(userId: number, invalidTokens: string[]) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true },
        });

        if (!user || !Array.isArray(user.fcmTokens)) return;

        const validTokens = (user.fcmTokens as string[]).filter(
            (token) => !invalidTokens.includes(token)
        );

        await prisma.user.update({
            where: { id: userId },
            data: { fcmTokens: validTokens },
        });

        console.log(`Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
    } catch (error) {
        console.error(`Failed to remove invalid tokens for user ${userId}:`, error);
    }
}
