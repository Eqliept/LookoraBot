import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

globalThis.process?.on("beforeExit", async () => {
    await prisma.$disconnect();
});
