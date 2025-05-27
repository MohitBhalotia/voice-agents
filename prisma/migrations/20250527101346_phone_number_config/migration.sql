/*
  Warnings:

  - Added the required column `agentId` to the `PhoneNumber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhoneNumber" ADD COLUMN     "agentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
