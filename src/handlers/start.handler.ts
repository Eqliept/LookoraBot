import { Bot, InputFile } from "grammy";
import type { Language } from "../states/user.state.js";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getLanguageKeyboard, getMainMenuKeyboard, getBackKeyboard, getHelpMenuKeyboard, getAgreementKeyboardByLang, getSubscriptionKeyboardByLang } from "../keyboards/index.js";
import { userExists, createUser, updateUserLanguage, findUser, claimChannelBonus } from "../services/user.service.js";
import { MAIN_IMAGE, HELP_IMAGE, CHANNEL_ID, CHANNEL_BONUS } from "../constants/index.js";
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
import { logger, logUserAction, logError, logCoinsOperation } from "../utils/logger.js";

const pendingAgreement = new Map<number, Language>();

async function getUserLanguage(ctx: MyContext): Promise<TypedLanguage> {
    const user = await findUser(ctx.from!.id);
    return (user?.language as TypedLanguage) || "EN";
}

export async function getWelcomeMessage(ctx: MyContext): Promise<string> {
    const lang = await getUserLanguage(ctx);
    return t('welcome', lang);
}

export async function getWelcomeBackMessage(ctx: MyContext): Promise<string> {
    const lang = await getUserLanguage(ctx);
    return t('welcome-back', lang);
}

export const startHandler = (bot: Bot<MyContext>) => {
    bot.command("start", async (ctx) => {
        try {
            const userId = ctx.from!.id;
            logUserAction(userId, 'start_command');

            const user = await findUser(userId);

            if (user) {

                if (!user.channelBonusClaimed) {

                    const lang = (user.language as TypedLanguage) || "EN";
                    await ctx.reply(t('subscription-required', lang), {
                        reply_markup: getSubscriptionKeyboardByLang(lang),
                        parse_mode: "Markdown"
                    });
                } else {

                    await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                        caption: await getWelcomeBackMessage(ctx),
                        reply_markup: getMainMenuKeyboard(ctx)
                    });
                }
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

    bot.callbackQuery("read_agreement", async (ctx) => {
        const userId = ctx.from!.id;
        const pendingLang = pendingAgreement.get(userId);
        const lang = pendingLang as TypedLanguage || await getUserLanguage(ctx);

        await ctx.reply(getAgreementText(lang), {
            reply_markup: getAgreementKeyboardByLang(lang)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("accept_agreement", async (ctx) => {
        const userId = ctx.from!.id;
        const language = pendingAgreement.get(userId);

        if (!language) {

            if (await userExists(userId)) {
                await ctx.answerCallbackQuery({ text: "✅" });
                return;
            }
            await ctx.answerCallbackQuery({ text: "Please select language first with /start" });
            return;
        }

        await createUser(userId, language);
        pendingAgreement.delete(userId);

        ctx.i18n.useLocale(language.toLowerCase());

        await ctx.editMessageText(getAgreementAcceptedText(language as TypedLanguage));

        await ctx.reply(t('subscription-required', language as TypedLanguage), {
            reply_markup: getSubscriptionKeyboardByLang(language as TypedLanguage),
            parse_mode: "Markdown"
        });

        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("check_registration_subscription", async (ctx) => {
        await ctx.answerCallbackQuery();

        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.reply(ctx.t("not-registered"));
            return;
        }

        if (user.channelBonusClaimed) {
            await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                caption: await getWelcomeMessage(ctx),
                reply_markup: getMainMenuKeyboard(ctx)
            });
            return;
        }

        try {

            const member = await ctx.api.getChatMember(CHANNEL_ID, ctx.from!.id);
            const isSubscribed = ["member", "administrator", "creator"].includes(member.status);

            if (!isSubscribed) {
                const lang = (user.language as TypedLanguage) || "EN";
                await ctx.reply(t('please-subscribe-first', lang), {
                    reply_markup: getSubscriptionKeyboardByLang(lang),
                    parse_mode: "Markdown"
                });
                return;
            }

            const updatedUser = await claimChannelBonus(ctx.from!.id, CHANNEL_BONUS);

            if (updatedUser) {
                logCoinsOperation(
                    ctx.from!.id,
                    'add',
                    CHANNEL_BONUS,
                    'Registration bonus (channel subscription)',
                    { channelId: CHANNEL_ID }
                );

                await ctx.reply(
                    t('subscription-success', user.language as TypedLanguage, { balance: updatedUser.coins }),
                    { parse_mode: "Markdown" }
                );

                await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                    caption: await getWelcomeMessage(ctx),
                    reply_markup: getMainMenuKeyboard(ctx)
                });
            }
        } catch (error) {
            logError(error as Error, 'check_registration_subscription', { userId: ctx.from?.id });
            await ctx.reply("❌ Не удалось проверить подписку. Убедитесь, что бот добавлен в канал как администратор.");
        }
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