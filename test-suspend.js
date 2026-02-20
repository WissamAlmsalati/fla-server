const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function test() {
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) return console.log("No admin");
  
  const token = jwt.sign(
    { sub: adminUser.id, role: adminUser.role, tokenVersion: adminUser.tokenVersion },
    process.env.ACCESS_TOKEN_SECRET
  );

  const res = await fetch(`http://localhost:3000/api/users/${adminUser.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ suspended: !adminUser.suspended })
  });

  console.log(res.status);
  console.log(await res.text());
}
test().catch(console.error).finally(()=>prisma.$disconnect());
