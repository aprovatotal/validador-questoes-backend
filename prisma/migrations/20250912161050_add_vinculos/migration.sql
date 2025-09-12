/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `discipline` will be added. If there are existing duplicate values, this will fail.
  - Made the column `externalId` on table `discipline` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `discipline_external_id` to the `module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module_external_id` to the `subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."discipline" ALTER COLUMN "externalId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."module" ADD COLUMN     "discipline_external_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."subject" ADD COLUMN     "module_external_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "discipline_externalId_key" ON "public"."discipline"("externalId");

-- AddForeignKey
ALTER TABLE "public"."module" ADD CONSTRAINT "module_discipline_external_id_fkey" FOREIGN KEY ("discipline_external_id") REFERENCES "public"."discipline"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject" ADD CONSTRAINT "subject_module_external_id_fkey" FOREIGN KEY ("module_external_id") REFERENCES "public"."module"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;
