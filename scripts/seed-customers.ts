import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCustomers() {
    console.log("Starting to seed customers...");

    try {
        const existingCustomersCount = await prisma.customer.count();
        console.log(`Existing customers in database: ${existingCustomersCount}`);

        const customersToCreate = 150;
        let createdCount = 0;

        for (let i = 1; i <= customersToCreate; i++) {
            const index = existingCustomersCount + i;
            const uniqueId = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

            const name = `Test Customer ${index}`;
            const email = `customer${index}_${uniqueId}@example.com`;
            const mobile = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
            const passwordHash = "123456"; // Default password
            const code = `LY-${Math.floor(1000 + Math.random() * 9000)}-${uniqueId}`;
            const dubaiCode = `DXB-${uniqueId}`;
            const usaCode = `USA-${uniqueId}`;
            const turkeyCode = `TR-${uniqueId}`;

            // Create User first
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    mobile,
                    passwordHash,
                    role: Role.CUSTOMER,
                    approved: true,
                }
            });

            // Create Customer associated with the user
            await prisma.customer.create({
                data: {
                    name,
                    code,
                    dubaiCode,
                    usaCode,
                    turkeyCode,
                    userId: user.id
                }
            });

            createdCount++;
            if (createdCount % 10 === 0) {
                console.log(`Created ${createdCount}/${customersToCreate} customers...`);
            }
        }

        console.log(`✅ Successfully created ${createdCount} new customers and users!`);
        console.log(`📊 Total customers in database: ${existingCustomersCount + createdCount}`);
        console.log("\n🎉 Seed completed successfully!");

    } catch (error) {
        console.error("Error seeding customers:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCustomers();
