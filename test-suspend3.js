const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  mobile: z.string().optional(),
  photoUrl: z.string().optional(),
  passportUrl: z.string().optional(),
  customerCode: z.string().optional(),
  dubaiCode: z.string().optional(),
  usaCode: z.string().optional(),
  turkeyCode: z.string().optional(),
  suspended: z.boolean().optional(),
});

async function test() {
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const payload = updateUserSchema.parse({ suspended: true });
  console.log("payload", payload);
  const updateData = {
    name: payload.name,
    email: payload.email,
    role: payload.role,
    mobile: payload.mobile,
    photoUrl: payload.photoUrl,
    passportUrl: payload.passportUrl,
    suspended: payload.suspended,
  };
  console.log("updateData", updateData);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });
  console.log("updated", updated.suspended);
}
test().catch(console.error).finally(()=>prisma.$disconnect());
