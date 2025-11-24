/*
  Warnings:

  - A unique constraint covering the columns `[dubaiCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usaCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[abuhajCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "abuhajCode" TEXT,
ADD COLUMN     "dubaiCode" TEXT,
ADD COLUMN     "usaCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_dubaiCode_key" ON "Customer"("dubaiCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_usaCode_key" ON "Customer"("usaCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_abuhajCode_key" ON "Customer"("abuhajCode");
