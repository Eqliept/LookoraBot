import { Bot, InputFile } from "grammy";
import type { Language } from "../states/user.state.js";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getLanguageKeyboard, getMainMenuKeyboard, getBackKeyboard, getHelpMenuKeyboard, getAgreementKeyboardByLang } from "../keyboards/index.js";
import { userExists, createUser, updateUserLanguage, findUser } from "../services/user.service.js";
import { MAIN_IMAGE, HELP_IMAGE } from "../constants/index.js";
import { 
    getHowToUseText, 
    getAppearanceHelpText, 
    getStyleHelpText, 
    getCoinsHelpText, 
    getAgreementText,
    getHelpMenuText,
    getAgreementInfoText,
    getAgreementAcceptedText,
    getRegistrationBonusText
} from "../translations/help.translations.js";
import type { Language as TypedLanguage } from "../types/index.js";
import { t } from "../utils/i18n.js";
import { logger, logUserAction, logError } from "../utils/logger.js";

// Хранилище для пользователей, ожидающих принятия соглашения
const pendingAgreement = new Map<number, Language>();

/**
 * Получить язык пользователя
 */
async function getUserLanguage(ctx: MyContext): Promise<TypedLanguage> {
    const user = await findUser(ctx.from!.id);
    return (user?.language as TypedLanguage) || "EN";
}

/**
 * Получить приветственное сообщение
 */
export async function getWelcomeMessage(ctx: MyContext): Promise<string> {
    const lang = await getUserLanguage(ctx);
    return t('welcome', lang);
}

/**
 * Получить сообщение "с возвращением"
 */
export async function getWelcomeBackMessage(ctx: MyContext): Promise<string> {
    const lang = await getUserLanguage(ctx);
    return t('welcome-back', lang);
}

export const startHandler = (bot: Bot<MyContext>) => {
    bot.command("start", async (ctx) => {
        try {
            const userId = ctx.from!.id;
            logUserAction(userId, 'start_command');

            if (await userExists(userId)) {
                await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                    caption: await getWelcomeBackMessage(ctx),
                    reply_markup: getMainMenuKeyboard(ctx)
                });
            } else {
                await ctx.reply(ctx.t("select-language"), {
                    reply_markup: getLanguageKeyboard()
                });
            }
        } catch (error) {
            logError(error as Error, 'start_command', { userId: ctx.from?.id });
            await ctx.reply("❌ An error occurred. Please try again later.");
        }
    });

    // Команда /help
    bot.command("help", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            logUserAction(ctx.from!.id, 'help_command');
            
            await ctx.replyWithPhoto(new InputFile(HELP_IMAGE), {
                caption: getHelpMenuText(lang),
                reply_markup: getHelpMenuKeyboard(ctx)
            });
        } catch (error) {
            logError(error as Error, 'help_command', { userId: ctx.from?.id });
        }
    });

    // Команда /language
    bot.command("language", async (ctx) => {
        try {
            logUserAction(ctx.from!.id, 'language_command');
            
            await ctx.reply(ctx.t("select-language"), {
                reply_markup: getLanguageKeyboard()
            });
        } catch (error) {
            logError(error as Error, 'language_command', { userId: ctx.from?.id });
        }
    });

    bot.callbackQuery(/^lang_(EN|ES|PT|FR|RU|UA)$/, async (ctx) => {
        try {
            const userId = ctx.from!.id;
            const language = ctx.match[1] as Language;
            const isNewUser = !(await userExists(userId));

            logUserAction(userId, 'language_selected', { language, isNewUser });

            if (isNewUser) {
                // Для нового пользователя - показываем соглашение
                pendingAgreement.set(userId, language);
                ctx.i18n.useLocale(language.toLowerCase());
                
                await ctx.editMessageText(getAgreementInfoText(language as TypedLanguage), {
                    reply_markup: getAgreementKeyboardByLang(language as TypedLanguage)
                });
            } else {
                await updateUserLanguage(userId, language);
                ctx.i18n.useLocale(language.toLowerCase());

                await ctx.editMessageText(ctx.t("language-set"));
                await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                    caption: await getWelcomeMessage(ctx),
                    reply_markup: getMainMenuKeyboard(ctx)
                });
            }
            
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'language_select', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    // Прочитать лицензионное соглашение (при регистрации)
    bot.callbackQuery("read_agreement", async (ctx) => {
        const userId = ctx.from!.id;
        const pendingLang = pendingAgreement.get(userId);
        const lang = pendingLang as TypedLanguage || await getUserLanguage(ctx);
        
        await ctx.reply(getAgreementText(lang), {
            reply_markup: getAgreementKeyboardByLang(lang)
        });
        await ctx.answerCallbackQuery();
    });

    // Принять лицензионное соглашение
    bot.callbackQuery("accept_agreement", async (ctx) => {
        const userId = ctx.from!.id;
        const language = pendingAgreement.get(userId);
        
        if (!language) {
            // Если пользователь уже зарегистрирован
            if (await userExists(userId)) {
                await ctx.answerCallbackQuery({ text: "✅" });
                return;
            }
            await ctx.answerCallbackQuery({ text: "Please select language first with /start" });
            return;
        }

        // Создаём пользователя (теперь с 100 койнами и channelBonusClaimed: true)
        await createUser(userId, language);
        pendingAgreement.delete(userId);
        
        ctx.i18n.useLocale(language.toLowerCase());
        
        // Показываем сообщение о принятии соглашения
        await ctx.editMessageText(getAgreementAcceptedText(language as TypedLanguage));
        
        // Показываем информацию о регистрационном бонусе
        await ctx.reply(getRegistrationBonusText(language as TypedLanguage), {
            parse_mode: "Markdown"
        });
        
        // Показываем главное меню
        await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
            caption: await getWelcomeMessage(ctx),
            reply_markup: getMainMenuKeyboard(ctx)
        });
        
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("change_language", async (ctx) => {
        await ctx.reply(ctx.t("select-language"), {
            reply_markup: getLanguageKeyboard()
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("help", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.replyWithPhoto(new InputFile(HELP_IMAGE), {
            caption: getHelpMenuText(lang),
            reply_markup: getHelpMenuKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Разделы помощи
    bot.callbackQuery("help_how_to_use", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            await ctx.reply(getHowToUseText(lang), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_how_to_use', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    bot.callbackQuery("help_appearance", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            await ctx.reply(getAppearanceHelpText(lang), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_appearance', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    bot.callbackQuery("help_style", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            await ctx.reply(getStyleHelpText(lang), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_style', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    bot.callbackQuery("help_hair", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            await ctx.reply(ctx.t("help-hair-text"), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_hair', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    bot.callbackQuery("help_battle", async (ctx) => {
        try {
            await ctx.reply(ctx.t("help-battle-text"), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_battle', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    bot.callbackQuery("help_coins", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            await ctx.reply(getCoinsHelpText(lang), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_coins', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });

    bot.callbackQuery("help_agreement", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx);
            await ctx.reply(getAgreementText(lang), {
                reply_markup: getBackKeyboard(ctx)
            });
            await ctx.answerCallbackQuery();
        } catch (error) {
            logError(error as Error, 'help_agreement', { userId: ctx.from?.id });
            await ctx.answerCallbackQuery();
        }
    });
};