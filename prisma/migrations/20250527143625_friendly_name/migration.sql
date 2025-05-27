/*
  Warnings:

  - Made the column `friendlyName` on table `PhoneNumber` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PhoneNumber" ALTER COLUMN "friendlyName" SET NOT NULL;
