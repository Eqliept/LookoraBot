-- CreateTable
CREATE TABLE "PreCheck" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PreCheck_pkey" PRIMARY KEY ("id")
);
