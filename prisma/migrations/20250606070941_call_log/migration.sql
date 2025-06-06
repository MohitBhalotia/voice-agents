/*
  Warnings:

  - Added the required column `sessionId` to the `CallLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `durationSeconds` on table `CallLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CallLog" ADD COLUMN     "audio_recording_path" TEXT,
ADD COLUMN     "callerId" TEXT,
ADD COLUMN     "disposition" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ALTER COLUMN "durationSeconds" SET NOT NULL;

-- AlterTable
ALTER TABLE "CallTranscript" ADD COLUMN     "confidence_score" DOUBLE PRECISION,
ADD COLUMN     "is_pii_redacted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sentiment_score" DOUBLE PRECISION,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KnowledgeSource" ALTER COLUMN "originalFileName" DROP NOT NULL;
