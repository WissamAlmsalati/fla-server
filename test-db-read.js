const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.pendingRegistration.findFirst({
    where: { email: 'wissamalmsalati+testloc@gmail.com' }
  });
  console.log(p);
}
main();
