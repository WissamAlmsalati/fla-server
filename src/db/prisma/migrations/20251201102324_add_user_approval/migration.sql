-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'canceled';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderMessage" ADD COLUMN     "replyToId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMessage" ADD CONSTRAINT "OrderMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "OrderMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
