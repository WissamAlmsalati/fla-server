import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔢 Resetting Database Sequences...");

    // The shipping codes generation usually queries the last customer ID
    // or depends on auto-increment IDs being reset to 1.

    // To safely restart identity sequences without deleting existing rows 
    // (like the Admin user), we do TRUNCATE on the tables that are empty,
    // or we manually set the sequence for tables that aren't empty (like User)
    // to be the max(id) so that new users get IDs starting directly after admin.
    // Wait, if the shipping code depends on the integer ID (e.g. FLL-37 comes from ID 37),
    // we need to see how the client generates it.

    const tables = [
        "ShipmentItem", "Shipment", "OrderMessage", "OrderLog", "Order",
        "Transaction", "Customer", "Notification", "Flight",
        "Announcement", "PendingRegistration", "PasswordResetCode", "SettingsChangeLog"
    ];

    for (const table of tables) {
        try {
            // For empty tables, RESTART IDENTITY resets the auto-increment to 1
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
            console.log(`✅ Reset sequence for ${table}`);
        } catch (e) {
            console.error(`❌ Failed to reset sequence for ${table}:`, e);
        }
    }

    // Treat User specially (we didn't truncate it because it has the Admin user)
    // Get max user ID
    const maxUser = await prisma.user.aggregate({
        _max: { id: true }
    });

    const maxId = maxUser._max.id || 0;

    try {
        // Reset User sequence to start right after the max ID (Admin ID)
        await prisma.$executeRawUnsafe(`SELECT setval('"User_id_seq"', ${maxId > 0 ? maxId : 1}, true);`);
        console.log(`✅ Adjusted sequence for User table to ${maxId}`);
    } catch (e) {
        console.error(`❌ Failed to adjust User sequence:`, e);
    }

    console.log("🎉 Sequences reset successfully!");
    console.log("Note: Any new customers added will now start from ID 1 (e.g., KO219-FLL1)");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
