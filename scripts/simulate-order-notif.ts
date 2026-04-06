import { prisma } from "../src/lib/prisma";
import { sendNotificationToUser } from "../src/lib/notifications";

async function simulateOrderNotification() {
    const orderId = 1; // Example ID
    const customerId = 16; // Example customer with tokens
    
    const customerUser = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { user: true },
    });

    if (customerUser?.user) {
        const title = "Simulation: New Order";
        const notifBody = "This is a simulated notification for a new order.";

        // Create notification
        const dbNotification = await prisma.notification.create({
            data: {
                title,
                body: notifBody,
                userId: customerUser.user.id,
                type: "NEW_ORDER",
                referenceId: orderId,
            },
        });

        console.log(`Created DB notification ${dbNotification.id}`);

        const custTokens = (Array.isArray(customerUser.user.fcmTokens) ? customerUser.user.fcmTokens : []) as string[];
        if (custTokens.length > 0) {
            console.log(`Sending to ${custTokens.length} tokens...`);
            const sendStatus = await sendNotificationToUser(
                custTokens,
                title,
                notifBody,
                {
                    orderId: String(orderId),
                    type: "new_order",
                    notificationId: String(dbNotification.id),
                }
            );

            console.log("Send Status:", JSON.stringify(sendStatus, null, 2));

            if (sendStatus.success && !sendStatus.simulated) {
                await prisma.notification.update({
                    where: { id: dbNotification.id },
                    data: { firebaseSent: true }
                });
                console.log("Updated DB notification with firebaseSent: true");
            }
        }
    }
}

simulateOrderNotification().catch(console.error).finally(() => prisma.$disconnect());
