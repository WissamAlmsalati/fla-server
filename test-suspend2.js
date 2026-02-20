const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  console.log("suspended in DB:", user.suspended);
}
test().catch(console.error).finally(()=>prisma.$disconnect());
