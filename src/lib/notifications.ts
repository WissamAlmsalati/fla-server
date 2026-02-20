import { firebaseAdmin } from './firebase';

export async function sendNotificationToUser(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
) {
    if (!firebaseAdmin || fcmTokens.length === 0) {
        return;
    }

    try {
        const message = {
            notification: {
                title,
                body,
            },
            data,
            tokens: fcmTokens,
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

        // Check for invalid tokens to potentially remove them from DB
        const failedTokens: string[] = [];
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    // If the token is invalid or not registered, we should probably remove it later,
                    // but for now we just log it.
                    console.warn(`Failed to send notification to token ${fcmTokens[idx]}:`, resp.error);
                }
            });
        }

        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
}
