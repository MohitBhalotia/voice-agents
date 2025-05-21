/*
  Warnings:

  - The `llmModel` column on the `AgentConfiguration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `KnowledgeSource` table. All the data in the column will be lost.
  - Added the required column `agent_language` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `concurrent_calls_limit` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daily_calls_limit` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fetch_initiation_webhook_url` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_conversation_duration_seconds` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_call_webhook_url` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `silence_end_call_timeout_seconds` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turn_timeout_seconds` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_input_audio_format` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voice_similarity_boost` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voice_speed` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voice_stability` to the `AgentConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `KnowledgeSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFileName` to the `KnowledgeSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `KnowledgeSource` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `sourceType` on the `KnowledgeSource` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "llm_model" AS ENUM ('openai gpt 4o mini', 'anthropic claude-3 haiku');

-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('PDF', 'TXT', 'CSV', 'DOCX', 'URL');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('PENDING', 'PROCESSING', 'ACTIVE', 'ERROR');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "AgentConfiguration" ADD COLUMN     "agent_language" TEXT NOT NULL,
ADD COLUMN     "concurrent_calls_limit" INTEGER NOT NULL,
ADD COLUMN     "conversation_retention_days" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "daily_calls_limit" INTEGER NOT NULL,
ADD COLUMN     "enable_auth_for_agent_api" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fetch_initiation_webhook_url" TEXT NOT NULL,
ADD COLUMN     "max_conversation_duration_seconds" INTEGER NOT NULL,
ADD COLUMN     "optimize_streaming_latency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "post_call_webhook_url" TEXT NOT NULL,
ADD COLUMN     "silence_end_call_timeout_seconds" INTEGER NOT NULL,
ADD COLUMN     "store_call_audio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tokenLimit" INTEGER NOT NULL DEFAULT 4096,
ADD COLUMN     "tts_output_format" TEXT NOT NULL DEFAULT 'mp3',
ADD COLUMN     "turn_timeout_seconds" INTEGER NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "use_flash_call" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "use_rag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_input_audio_format" TEXT NOT NULL,
ADD COLUMN     "voice_similarity_boost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "voice_speed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "voice_stability" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "zero_pii_retention" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "llmModel",
ADD COLUMN     "llmModel" "llm_model" NOT NULL DEFAULT 'openai gpt 4o mini',
ALTER COLUMN "temperature" SET DEFAULT 0.7;

-- AlterTable
ALTER TABLE "KnowledgeSource" DROP COLUMN "createdAt",
ADD COLUMN     "last_indexed_at" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "originalFileName" TEXT NOT NULL,
ADD COLUMN     "status" "status" NOT NULL,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "sourceType",
ADD COLUMN     "sourceType" "source_type" NOT NULL;
