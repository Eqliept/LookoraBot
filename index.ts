import { Bot } from "grammy";
import "dotenv/config";
import { createHandlers } from "./src/createHandlers.ts";
import { createGuards } from "./src/createGuards.ts";
import { createMiddlewares } from "./src/createMiddlewares.ts";
import { setupBotCommands } from "./src/setupBotMenu.ts";
import type { MyContext } from "./src/middleware/autoLanguage.middleware.ts";

const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

createMiddlewares(bot);
createGuards(bot);
createHandlers(bot);

// Настраиваем меню команд и запускаем бота
setupBotCommands(bot).then(() => {
    bot.start();
    console.log("🤖 Bot started!");
});