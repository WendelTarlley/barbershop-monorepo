/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `barbershop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document` to the `barbershop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "barbershop" ADD COLUMN     "document" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "barbershop_document_key" ON "barbershop"("document");
