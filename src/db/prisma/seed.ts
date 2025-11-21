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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
