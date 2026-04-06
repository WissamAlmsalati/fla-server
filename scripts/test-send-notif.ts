import { sendNotificationToUser } from '../src/lib/notifications';
import { prisma } from "../src/lib/prisma";

async function main() {
    // Find the user with tokens we saw earlier (ID 5)
    const user = await prisma.user.findUnique({
        where: { id: 5 },
        select: { fcmTokens: true, name: true }
    });

    if (!user || !user.fcmTokens) {
        console.error("User 5 not found or has no tokens");
        return;
    }

    const tokens = (Array.isArray(user.fcmTokens) ? user.fcmTokens : []) as string[];
    console.log(`Sending test notification to ${user.name} with ${tokens.length} tokens...`);

    const result = await sendNotificationToUser(
        tokens,
        "Test Notification",
        "This is a test notification from the backend script",
        { type: "test" }
    );

    console.log("Result:", JSON.stringify(result, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
