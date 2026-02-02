-- AlterTable
ALTER TABLE "User" ADD COLUMN     "channelBonusClaimed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "coins" SET DEFAULT 0;
