import { Context } from "grammy";
import { findUser } from "../services/user.service.ts";
import type { I18nFlavor } from "@grammyjs/i18n";

export type MyContext = Context & I18nFlavor;

export const autoLanguageMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    if (ctx.from) {
        const user = findUser(ctx.from.id);
        if (user) {
            ctx.i18n.useLocale(user.language.toLowerCase());
        }
    }
    await next();
};

/**
 * Middleware для проверки авторизации пользователя
 * Пропускает только /start и выбор языка для неавторизованных
 */
export const authMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    // Пропускаем команду /start
    if (ctx.message?.text?.startsWith("/start")) {
        return next();
    }

    // Пропускаем callback выбора языка
    if (ctx.callbackQuery?.data?.startsWith("lang_")) {
        return next();
    }

    // Проверяем авторизацию
    if (ctx.from) {
        const user = findUser(ctx.from.id);
        if (user) {
            return next();
        }
    }

    // Пользователь не авторизован
    if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({ 
            text: "❌ Please register first with /start", 
            show_alert: true 
        });
    } else if (ctx.message) {
        await ctx.reply("❌ Please register first with /start command.\n\n🌍 Для начала работы выполните команду /start");
    }
};