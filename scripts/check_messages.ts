
import { prisma } from "../src/lib/prisma";

async function main() {
    const messages = await prisma.orderMessage.findMany({
        where: { orderId: 6 },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(messages, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
