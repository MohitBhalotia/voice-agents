/*
  Warnings:

  - The `agent_language` column on the `AgentConfiguration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "agent_language" AS ENUM ('en');

-- AlterTable
ALTER TABLE "AgentConfiguration" DROP COLUMN "agent_language",
ADD COLUMN     "agent_language" "agent_language" NOT NULL DEFAULT 'en';
