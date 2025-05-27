/*
  Warnings:

  - Added the required column `sid` to the `PhoneNumber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhoneNumber" ADD COLUMN     "sid" TEXT NOT NULL;
