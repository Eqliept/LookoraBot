import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Закрытие соединения при завершении процесса
globalThis.process?.on("beforeExit", async () => {
    await prisma.$disconnect();
});
