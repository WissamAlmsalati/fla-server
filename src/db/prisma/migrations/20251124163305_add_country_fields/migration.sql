-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "country" TEXT DEFAULT 'CHINA';

-- AlterTable
ALTER TABLE "ShippingRate" ADD COLUMN     "country" TEXT DEFAULT 'CHINA';
