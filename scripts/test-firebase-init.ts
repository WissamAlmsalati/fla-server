import { firebaseAdmin } from '../src/lib/firebase';
console.log('Firebase initialized:', !!firebaseAdmin?.apps?.length);
import { prisma } from "../src/lib/prisma";
async function main() {
    const users = await prisma.user.findMany({
        where: {
            NOT: {
                fcmTokens: { equals: "[]" }
            }
        },
        select: { id: true, email: true, name: true, fcmTokens: true }
    });
    console.log("Users with FCM tokens:", JSON.stringify(users, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
