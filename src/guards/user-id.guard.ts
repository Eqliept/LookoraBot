import { Bot } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";

export const userIdGuard = (bot: Bot<MyContext>) => {
    bot.use(async (ctx, next) => {
        if (!ctx.from || !ctx.from.id) {
            return;
        }

        await next();
    })
}