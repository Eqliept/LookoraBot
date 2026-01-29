/*
  Warnings:

  - You are about to drop the `PreCheck` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preCheckFails" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "PreCheck";
