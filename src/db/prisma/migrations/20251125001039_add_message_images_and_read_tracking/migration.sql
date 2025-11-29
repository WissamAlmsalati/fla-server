-- AlterTable
ALTER TABLE "OrderMessage" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "readBy" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
