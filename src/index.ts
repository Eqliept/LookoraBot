import { Bot } from "grammy";
import "dotenv/config";
import { createHandlers } from "./createHandlers.js";
import { createGuards } from "./createGuards.js";
import { createMiddlewares } from "./createMiddlewares.js";
import { setupBotCommands } from "./setupBotMenu.js";
import type { MyContext } from "./middleware/autoLanguage.middleware.js";
import { setBotInstance, logger } from "./utils/logger.js";

const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

setBotInstance(bot);

createMiddlewares(bot);
createGuards(bot);
createHandlers(bot);

setupBotCommands(bot).then(() => {
    bot.start();
    logger.info("🤖 Bot started successfully!");
});