const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    const pending = await prisma.pendingRegistration.findUnique({
        where: { email: 'wissamalmsalati+testloc@gmail.com' }
    });
    console.log('Pending Registration Location:', pending?.location);
    await prisma.$disconnect();
}

checkDb();
