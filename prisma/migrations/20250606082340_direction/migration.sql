/*
  Warnings:

  - Added the required column `direction` to the `CallLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CallLog" ADD COLUMN     "direction" TEXT NOT NULL;
