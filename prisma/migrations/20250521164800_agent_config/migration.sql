-- AlterTable
ALTER TABLE "AgentConfiguration" ALTER COLUMN "fetch_initiation_webhook_url" DROP NOT NULL,
ALTER COLUMN "post_call_webhook_url" DROP NOT NULL;
