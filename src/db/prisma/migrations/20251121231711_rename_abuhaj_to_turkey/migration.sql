/*
  Warnings:

  - You are about to drop the column `abuhajCode` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[turkeyCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_abuhajCode_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "abuhajCode",
ADD COLUMN     "turkeyCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_turkeyCode_key" ON "Customer"("turkeyCode");
