import { firebaseAdmin } from './firebase';

export async function sendNotificationToUser(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
) {
    if (!firebaseAdmin || !firebaseAdmin.apps?.length || fcmTokens.length === 0) {
        console.log(`[MOCK NOTIFICATION] To ${fcmTokens.length} tokens. Title: ${title}`);
        return { 
            simulated: true, 
            success: true, 
            message: !fcmTokens.length ? "No tokens provided" : "Firebase not initialized. Simulated push." 
        };
    }

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
            }
        }

        const response = {
            responses,
            successCount,
            failureCount,
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
