import { firebaseAdmin } from './firebase';

export async function sendNotificationToUser(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
) {
    if (!firebaseAdmin || fcmTokens.length === 0) {
        console.log(`[MOCK NOTIFICATION] To ${fcmTokens.length} tokens. Title: ${title}`);
        return { simulated: true, success: true, message: "Firebase not initialized or no tokens. Simulated push." };
    }

    try {
        // Temporary workaround for Next.js fetch concurrency bug dropping Authorization headers
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
                    token,
                };
                const messageId = await firebaseAdmin.messaging().send(singleMessage);
                responses.push({ success: true, messageId });
                successCount++;
            } catch (err: any) {
                responses.push({ success: false, error: err });
                failureCount++;
                console.warn(`Failed to send notification to token ${token}:`, err.message || err);
            }
        }

        const response = {
            responses,
            successCount,
            failureCount,
        };

        return { simulated: false, success: true, response };
    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { simulated: false, success: false, error: error.message };
    }
}
