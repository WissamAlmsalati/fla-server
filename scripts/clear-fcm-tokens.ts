import { prisma } from "../src/lib/prisma";

async function clearAllFcmTokens() {
    try {
        console.log("Clearing all FCM tokens from database...");

        const result = await prisma.user.updateMany({
            data: {
                fcmTokens: [],
            },
        });

        console.log(`Cleared FCM tokens for ${result.count} users`);
        console.log("Users will need to re-register their devices for push notifications");
    } catch (error) {
        console.error("Error clearing FCM tokens:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Also clear tokens for specific users if needed
async function clearFcmTokensForUser(userId: number) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { fcmTokens: [] },
        });
        console.log(`Cleared FCM tokens for user ${userId}`);
    } catch (error) {
        console.error(`Error clearing tokens for user ${userId}:`, error);
    }
}

// Run the full clear
async function main() {
    const args = process.argv.slice(2);

    if (args.includes("--user") && args[args.indexOf("--user") + 1]) {
        const userId = parseInt(args[args.indexOf("--user") + 1]);
        await clearFcmTokensForUser(userId);
    } else {
        console.log("Usage:");
        console.log("  npx ts-node scripts/clear-fcm-tokens.ts           # Clear all tokens");
        console.log("  npx ts-node scripts/clear-fcm-tokens.ts --user 1  # Clear tokens for specific user");
        console.log("");
        console.log("This will clear all FCM tokens so users can re-register with the correct Firebase project.");
        console.log("");

        // Uncomment to actually run:
        // await clearAllFcmTokens();

        console.log("Script is in dry-run mode. Uncomment the line above to execute.");
    }
}

main().catch(console.error);
