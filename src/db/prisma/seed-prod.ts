import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Running production seed...");

    // ── Warehouses ──
    const warehouses = [
        { name: "China Warehouse", country: "China" },
        { name: "Libya Warehouse", country: "Libya" },
    ];

    for (const w of warehouses) {
        const exists = await prisma.warehouse.findFirst({ where: { name: w.name } });
        if (!exists) {
            await prisma.warehouse.create({ data: w });
            console.log(`✅ Created warehouse: ${w.name}`);
        } else {
            console.log(`⏭️  Warehouse already exists: ${w.name}`);
        }
    }

    // ── Admin User ──
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fll.ly";
    const adminPassword = process.env.ADMIN_PASSWORD || "Fll@Adm!n#2026$Xz";
    const adminName = process.env.ADMIN_NAME || "مدير النظام";

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash: adminPassword,
            name: adminName,
            role: Role.ADMIN,
        },
        create: {
            name: adminName,
            email: adminEmail,
            passwordHash: adminPassword,
            role: Role.ADMIN,
        },
    });
    console.log(`✅ Admin user ready: ${admin.email} (id: ${admin.id})`);

    // ── Shipping Rates ──
    const shippingRates = [
        { type: "AIR" as const, name: "شحن جوي عادي", price: 8.0, country: "CHINA" },
        { type: "SEA" as const, name: "شحن بحري", price: 3.5, country: "CHINA" },
        { type: "AIR" as const, name: "شحن جوي سريع", price: 12.0, country: "CHINA" },
    ];

    for (const rate of shippingRates) {
        const exists = await prisma.shippingRate.findFirst({
            where: { name: rate.name, country: rate.country },
        });
        if (!exists) {
            await prisma.shippingRate.create({ data: rate });
            console.log(`✅ Created shipping rate: ${rate.name} ($${rate.price}/kg)`);
        } else {
            console.log(`⏭️  Shipping rate already exists: ${rate.name}`);
        }
    }

    console.log("\n🎉 Production seed complete!");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
