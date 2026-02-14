import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Warehouses
  const warehouses = [
    { name: "China Warehouse", country: "China" },
    { name: "Libya Warehouse", country: "Libya" },
  ];

  for (const w of warehouses) {
    const exists = await prisma.warehouse.findFirst({ where: { name: w.name } });
    if (!exists) {
      await prisma.warehouse.create({ data: w });
    }
  }

  // Admin User
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: "changeme",
      role: Role.ADMIN,
    },
  });

  // Customers
  const customers = [
    { name: "Ali Ahmed", email: "ali@example.com" },
    { name: "Mohammed Salem", email: "mohammed@example.com" },
    { name: "Sara Khaled", email: "sara@example.com" },
  ];

  for (const c of customers) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        passwordHash: "123456",
        role: Role.CUSTOMER,
      },
    });

    const customerExists = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customerExists) {
      await prisma.customer.create({
        data: {
          name: c.name,
          userId: user.id,
          code: `LY-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }
  }

  // Standalone Customer (no user)
  const standaloneName = "Company XYZ";
  const standaloneExists = await prisma.customer.findFirst({ where: { name: standaloneName } });
  if (!standaloneExists) {
    await prisma.customer.create({
      data: {
        name: standaloneName,
        code: `LY-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
  }

  // ── Seed Orders ──
  const allCustomers = await prisma.customer.findMany();
  if (allCustomers.length === 0) {
    console.log("No customers found, skipping order seeding.");
  } else {
    const existingOrderCount = await prisma.order.count();
    if (existingOrderCount === 0) {
      const statuses: Array<
        "purchased" | "arrived_to_china" | "shipping_to_libya" | "arrived_libya" | "ready_for_pickup" | "delivered" | "canceled"
      > = [
          "purchased",
          "arrived_to_china",
          "shipping_to_libya",
          "arrived_libya",
          "ready_for_pickup",
          "delivered",
          "canceled",
        ];

      const orderData = [
        { name: "هاتف Samsung Galaxy S24", usdPrice: 850, cnyPrice: 6120, weight: 0.35, status: "purchased" as const },
        { name: "سماعات Sony WH-1000XM5", usdPrice: 320, cnyPrice: 2305, weight: 0.25, status: "purchased" as const },
        { name: "ساعة Casio G-Shock", usdPrice: 120, cnyPrice: 864, weight: 0.15, status: "purchased" as const },
        { name: "كابلات شحن متنوعة (50 قطعة)", usdPrice: 45, cnyPrice: 324, weight: 1.2, status: "arrived_to_china" as const },
        { name: "حافظات هاتف iPhone 15 (100 قطعة)", usdPrice: 200, cnyPrice: 1440, weight: 3.5, status: "arrived_to_china" as const },
        { name: "شاشة LED مقاس 27 بوصة", usdPrice: 280, cnyPrice: 2016, weight: 5.0, status: "arrived_to_china" as const },
        { name: "حذاء رياضي Nike Air Max", usdPrice: 160, cnyPrice: 1152, weight: 0.8, status: "shipping_to_libya" as const },
        { name: "ملابس أطفال (20 قطعة)", usdPrice: 95, cnyPrice: 684, weight: 2.0, status: "shipping_to_libya" as const },
        { name: "قطع غيار سيارات - فلتر هواء", usdPrice: 35, cnyPrice: 252, weight: 0.5, status: "shipping_to_libya" as const },
        { name: "أدوات مطبخ كهربائية - خلاط", usdPrice: 55, cnyPrice: 396, weight: 2.5, status: "arrived_libya" as const },
        { name: "كاميرا مراقبة واي فاي (4 قطع)", usdPrice: 180, cnyPrice: 1296, weight: 1.8, status: "arrived_libya" as const },
        { name: "طابعة HP LaserJet", usdPrice: 220, cnyPrice: 1584, weight: 6.0, status: "arrived_libya" as const },
        { name: "لابتوب Lenovo ThinkPad", usdPrice: 750, cnyPrice: 5400, weight: 2.2, status: "ready_for_pickup" as const },
        { name: "جهاز بروجكتر صغير", usdPrice: 190, cnyPrice: 1368, weight: 1.1, status: "ready_for_pickup" as const },
        { name: "أكسسوارات سيارة - مسجل DVR", usdPrice: 65, cnyPrice: 468, weight: 0.3, status: "ready_for_pickup" as const },
        { name: "مكنسة كهربائية روبوت", usdPrice: 300, cnyPrice: 2160, weight: 3.8, status: "delivered" as const },
        { name: "طقم أدوات إصلاح منزلي", usdPrice: 75, cnyPrice: 540, weight: 4.0, status: "delivered" as const },
        { name: "مروحة سقف ذكية بريموت", usdPrice: 110, cnyPrice: 792, weight: 5.5, status: "delivered" as const },
        { name: "كرسي مكتب مريح", usdPrice: 250, cnyPrice: 1800, weight: 12.0, status: "canceled" as const },
        { name: "تلفاز TCL 55 بوصة", usdPrice: 400, cnyPrice: 2880, weight: 15.0, status: "canceled" as const },
      ];

      for (let i = 0; i < orderData.length; i++) {
        const o = orderData[i];
        const customer = allCustomers[i % allCustomers.length];
        await prisma.order.create({
          data: {
            trackingNumber: `TRK-${Date.now()}-${String(i + 1).padStart(3, "0")}`,
            name: o.name,
            usdPrice: o.usdPrice,
            cnyPrice: o.cnyPrice,
            weight: o.weight,
            status: o.status,
            customerId: customer.id,
            country: "CHINA",
          },
        });
      }
      console.log(`Seeded ${orderData.length} orders.`);
    } else {
      console.log(`Orders already exist (${existingOrderCount}), skipping.`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
