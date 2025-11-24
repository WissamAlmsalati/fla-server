import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingCustomers() {
    console.log('🔍 Finding customers missing shipping codes...');

    // Get all customers that have a code but missing other codes
    const customers = await prisma.customer.findMany({
        where: {
            OR: [
                { dubaiCode: null },
                { usaCode: null },
                { turkeyCode: null },
            ]
        },
        orderBy: { id: 'asc' }
    });

    console.log(`📦 Found ${customers.length} customers to update`);

    for (const customer of customers) {
        // Extract the number from the China code
        const match = customer.code.match(/KO219-FLL(\d+)/);
        if (match) {
            const number = match[1];

            const dubaiCode = `BSB FLL D${number}`;
            const usaCode = `Global FLL ${number}`;
            const turkeyCode = `ABUHAJ FLL${number}`;

            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    dubaiCode: customer.dubaiCode || dubaiCode,
                    usaCode: customer.usaCode || usaCode,
                    turkeyCode: customer.turkeyCode || turkeyCode,
                }
            });

            console.log(`✅ Updated customer ${customer.id} (${customer.name})`);
            console.log(`   China: ${customer.code}`);
            console.log(`   Dubai: ${dubaiCode}`);
            console.log(`   USA: ${usaCode}`);
            console.log(`   Turkey: ${turkeyCode}`);
        } else {
            console.log(`⚠️  Skipped customer ${customer.id} - invalid code format: ${customer.code}`);
        }
    }

    console.log('✅ Migration complete!');
}

updateExistingCustomers()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
