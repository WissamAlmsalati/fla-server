const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📊 ORDER STATISTICS\n');
    console.log('='.repeat(50));

    // Get all customers
    const customers = await prisma.customer.findMany({
        include: {
            user: true,
            orders: true
        }
    });

    for (const customer of customers) {
        console.log(`\n👤 Customer: ${customer.name} (ID: ${customer.id})`);
        console.log(`📧 Email: ${customer.user?.email || 'N/A'}`);
        console.log('-'.repeat(50));

        // Group by status
        const statusStats = await prisma.order.groupBy({
            by: ['status'],
            where: { customerId: customer.id },
            _count: { id: true },
        });

        // Group by country
        const countryStats = await prisma.order.groupBy({
            by: ['country'],
            where: { customerId: customer.id },
            _count: { id: true },
        });

        // Get total count
        const totalCount = await prisma.order.count({
            where: { customerId: customer.id },
        });

        const byStatus = statusStats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {});

        const byCountry = countryStats.reduce((acc, curr) => {
            const country = curr.country || 'UNKNOWN';
            acc[country] = curr._count.id;
            return acc;
        }, {});

        const response = {
            data: {
                total: totalCount,
                byStatus,
                byCountry,
            },
        };

        console.log('\n📈 API Response for this customer:');
        console.log(JSON.stringify(response, null, 2));
        console.log('='.repeat(50));
    }
}

main()
    .catch(e => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
