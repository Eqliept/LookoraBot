import { Bot } from "grammy";
import "dotenv/config";
import { createHandlers } from "./createHandlers.js";
import { createGuards } from "./createGuards.js";
import { createMiddlewares } from "./createMiddlewares.js";
import { setupBotCommands } from "./setupBotMenu.js";
import { setBotInstance, logger } from "./utils/logger.js";
const bot = new Bot(process.env.BOT_TOKEN);
// Устанавливаем инстанс бота для уведомлений админа
setBotInstance(bot);
createMiddlewares(bot);
createGuards(bot);
createHandlers(bot);
// Настраиваем меню команд и запускаем бота
setupBotCommands(bot).then(() => {
    bot.start();
    logger.info("🤖 Bot started successfully!");
    console.log("🤖 Bot started!");
});
//# sourceMappingURL=index.js.map