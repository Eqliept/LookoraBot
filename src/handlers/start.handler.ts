import { Bot } from "grammy";
import type { Language } from "../states/user.state.ts";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { getLanguageKeyboard, getMainMenuKeyboard, getBackKeyboard } from "../keyboards/index.ts";
import { userExists, createUser, updateUserLanguage } from "../services/user.service.ts";

export const startHandler = (bot: Bot<MyContext>) => {
    bot.command("start", async (ctx) => {
        const userId = ctx.from!.id;

        if (userExists(userId)) {
            await ctx.reply(ctx.t("welcome-back"), {
                reply_markup: getMainMenuKeyboard(ctx)
            });
        } else {
            await ctx.reply(ctx.t("select-language"), {
                reply_markup: getLanguageKeyboard()
            });
        }
    });

    // Команда /help
    bot.command("help", async (ctx) => {
        await ctx.reply(ctx.t("help-info"), {
            reply_markup: getBackKeyboard(ctx)
        });
    });

    // Команда /language
    bot.command("language", async (ctx) => {
        await ctx.reply(ctx.t("select-language"), {
            reply_markup: getLanguageKeyboard()
        });
    });

    bot.callbackQuery(/^lang_(EN|ES|PT|FR|RU|UA)$/, async (ctx) => {
        const userId = ctx.from!.id;
        const language = ctx.match[1] as Language;
        const isNewUser = !userExists(userId);

        if (isNewUser) {
            createUser(userId, language);
        } else {
            updateUserLanguage(userId, language);
        }

        ctx.i18n.useLocale(language.toLowerCase());

        await ctx.editMessageText(ctx.t("language-set"));
        await ctx.reply(ctx.t("welcome"), {
            reply_markup: getMainMenuKeyboard(ctx)
        });
        
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("change_language", async (ctx) => {
        await ctx.editMessageText(ctx.t("select-language"), {
            reply_markup: getLanguageKeyboard()
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("help", async (ctx) => {
        await ctx.editMessageText(ctx.t("help-info"), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
};