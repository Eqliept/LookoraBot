import { Bot } from "grammy";
import "dotenv/config";
import { createHandlers } from "./createHandlers.js";
import { createGuards } from "./createGuards.js";
import { createMiddlewares } from "./createMiddlewares.js";
import { setupBotCommands } from "./setupBotMenu.js";
import type { MyContext } from "./middleware/autoLanguage.middleware.js";

const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

createMiddlewares(bot);
createGuards(bot);
createHandlers(bot);

// Настраиваем меню команд и запускаем бота
setupBotCommands(bot).then(() => {
    bot.start();
    console.log("🤖 Bot started!");
});