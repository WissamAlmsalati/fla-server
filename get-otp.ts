import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.pendingRegistration.findFirst({ orderBy: { id: "desc" }});
  console.log(p?.otp);
}
main();
