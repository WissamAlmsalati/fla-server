import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Starting Data Cleanup for Launch...");

    // Delete in order of dependencies to avoid foreign key constraint errors

    // 1. Shipments
    console.log("Deleting shipment items...");
    await prisma.shipmentItem.deleteMany({});
    console.log("Deleting shipments...");
    await prisma.shipment.deleteMany({});

    // 2. Orders
    console.log("Deleting order messages...");
    await prisma.orderMessage.deleteMany({});
    console.log("Deleting order logs...");
    await prisma.orderLog.deleteMany({});
    console.log("Deleting orders...");
    await prisma.order.deleteMany({});

    // 3. Transactions & Customers
    console.log("Deleting transactions...");
    await prisma.transaction.deleteMany({});
    console.log("Deleting customers...");
    await prisma.customer.deleteMany({});

    // 4. Notifications & Flights
    console.log("Deleting notifications...");
    await prisma.notification.deleteMany({});
    console.log("Deleting flights...");
    await prisma.flight.deleteMany({});

    // 5. Auth / Misc
    console.log("Deleting announcements...");
    await prisma.announcement.deleteMany({});
    console.log("Deleting pending registrations...");
    await prisma.pendingRegistration.deleteMany({});
    console.log("Deleting password reset codes...");
    await prisma.passwordResetCode.deleteMany({});
    console.log("Deleting settings change logs...");
    await prisma.settingsChangeLog.deleteMany({});

    // 6. Users (Except Admin)
    console.log("Deleting non-admin users...");
    const usersDeleted = await prisma.user.deleteMany({
        where: {
            role: {
                not: "ADMIN",
            },
        },
    });

    console.log("✅ Cleanup Complete! Ready for Launch 🚀");
    console.log(`🗑️ Deleted non-admin users: ${usersDeleted.count}`);
    console.log("ℹ️ Note: Warehouses, Shipping Rates, and Site Settings (Privacy Policy) have been preserved.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
