import { Bot } from "grammy";
export const userIdGuard = (bot) => {
    bot.use(async (ctx, next) => {
        if (!ctx.from || !ctx.from.id) {
            return;
        }
        await next();
    });
};
//# sourceMappingURL=user-id.guard.js.map