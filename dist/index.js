import { Bot } from "grammy";
import "dotenv/config";
import { createHandlers } from "./createHandlers.js";
import { createGuards } from "./createGuards.js";
import { createMiddlewares } from "./createMiddlewares.js";
import { setupBotCommands } from "./setupBotMenu.js";
const bot = new Bot(process.env.BOT_TOKEN);
createMiddlewares(bot);
createGuards(bot);
createHandlers(bot);
// Настраиваем меню команд и запускаем бота
setupBotCommands(bot).then(() => {
    bot.start();
    console.log("🤖 Bot started!");
});
//# sourceMappingURL=index.js.map