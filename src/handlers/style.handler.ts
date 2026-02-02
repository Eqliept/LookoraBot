import type { Bot } from "grammy";
import { InputFile, InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getStyleCategoryKeyboard, getBackKeyboard } from "../keyboards/index.js";
import { findUser, deductCoins, incrementPreCheckFails, resetPreCheckFails, PRECHECK_PENALTY, PRECHECK_FREE_ATTEMPTS } from "../services/user.service.js";
import { validateStylePhoto, analyzeStyle, styleAnalysisResults, getTelegramFileUrl } from "../services/gpt.service.js";
import type { StylePhotoSession, StyleCategory } from "../types/index.js";
import { STYLE_COST, FULL_BODY_PHOTO_EXAMPLE } from "../constants/index.js";
import { getStyleUI, getCategoryName, getCategoryDescription } from "../translations/style.translations.js";
import "dotenv/config";
import * as process from "node:process";
import * as fs from "node:fs";

const styleSessions = new Map<number, StylePhotoSession>();
const awaitingCustomDescription = new Set<number>();

// Функция для создания прогресс-бара
const getProgressBar = (value: number): string => {
    const filled = Math.round(value / 10);
    const empty = 10 - filled;
    return "▓".repeat(filled) + "░".repeat(empty);
};

export const styleHandler = (bot: Bot<MyContext>) => {
    // Оценить стиль - показать выбор категории
    bot.callbackQuery("rate_style", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        if (user.coins < STYLE_COST) {
            await ctx.reply(
                ctx.t("not-enough-coins", { balance: user.coins, required: STYLE_COST }),
                { reply_markup: getBackKeyboard(ctx) }
            );
            await ctx.answerCallbackQuery();
            return;
        }

        const ui = getStyleUI(user.language as any || "EN");
        await ctx.reply(ui.selectCategory, {
            reply_markup: getStyleCategoryKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Обработка выбора категории стиля
    const categoryCallbacks: StyleCategory[] = ["casual", "work", "date", "social", "event", "custom"];
    
    for (const category of categoryCallbacks) {
        bot.callbackQuery(`style_cat_${category}`, async (ctx) => {
            const user = await findUser(ctx.from!.id);
            if (!user) return;
            
            const ui = getStyleUI(user.language as any || "EN");
            const categoryName = getCategoryName(category, user.language as any || "EN");
            const categoryDesc = getCategoryDescription(category, user.language as any || "EN");

            if (category === "custom") {
                // Для custom - запрашиваем описание
                awaitingCustomDescription.add(ctx.from!.id);
                await ctx.reply(ui.enterCustomDesc, {
                    reply_markup: getBackKeyboard(ctx)
                });
            } else {
                // Для остальных - показываем описание и запрашиваем фото
                styleSessions.set(ctx.from!.id, { category });
                
                // Проверяем существование файла примера
                const hasExample = fs.existsSync(FULL_BODY_PHOTO_EXAMPLE);
                
                const message = `${categoryName}\n\n${categoryDesc}\n\n${ui.sendFullBodyPhoto}`;
                
                if (hasExample) {
                    await ctx.replyWithPhoto(new InputFile(FULL_BODY_PHOTO_EXAMPLE), {
                        caption: message,
                        reply_markup: getBackKeyboard(ctx)
                    });
                } else {
                    await ctx.reply(message, {
                        reply_markup: getBackKeyboard(ctx)
                    });
                }
            }
            await ctx.answerCallbackQuery();
        });
    }

    // Обработка текстовых сообщений (для custom описания)
    bot.on("message:text", async (ctx, next) => {
        if (!awaitingCustomDescription.has(ctx.from!.id)) {
            return next();
        }

        const user = await findUser(ctx.from!.id);
        if (!user) return next();

        const ui = getStyleUI(user.language as any || "EN");
        const text = ctx.message.text.trim();

        // Проверяем длину описания
        if (text.length < 4 || text.length > 30) {
            await ctx.reply(ui.invalidCustomDesc);
            return;
        }

        // Сохраняем сессию с custom описанием
        awaitingCustomDescription.delete(ctx.from!.id);
        styleSessions.set(ctx.from!.id, { 
            category: "custom", 
            customDescription: text 
        });

        // Проверяем существование файла примера
        const hasExample = fs.existsSync(FULL_BODY_PHOTO_EXAMPLE);
        
        const message = `✏️ ${text}\n\n${ui.sendFullBodyPhoto}`;
        
        if (hasExample) {
            await ctx.replyWithPhoto(new InputFile(FULL_BODY_PHOTO_EXAMPLE), {
                caption: message,
                reply_markup: getBackKeyboard(ctx)
            });
        } else {
            await ctx.reply(message, {
                reply_markup: getBackKeyboard(ctx)
            });
        }
    });

    // Обработка фото для стиля
    bot.on("message:photo", async (ctx, next) => {
        const session = styleSessions.get(ctx.from!.id);
        if (!session) {
            return next();
        }

        const user = await findUser(ctx.from!.id);
        if (!user) return next();

        const ui = getStyleUI(user.language as any || "EN");

        // Получаем URL фото
        const photo = ctx.message.photo[ctx.message.photo.length - 1]!;
        const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN!, photo.file_id);

        if (!photoUrl) {
            await ctx.reply(ctx.t("photo-invalid", { error: "Не удалось загрузить фото" }));
            return;
        }

        // Показываем статус проверки
        const checkingMsg = await ctx.reply(ctx.t("checking-photo"));

        // Проверяем качество фото
        const validation = await validateStylePhoto(photoUrl, (user.language || "EN") as any);

        await ctx.api.deleteMessage(ctx.chat!.id, checkingMsg.message_id);

        if (!validation.isValid) {
            const updatedUser = await incrementPreCheckFails(ctx.from!.id);
            
            let penaltyMessage = "";
            if (updatedUser && updatedUser.preCheckFails >= PRECHECK_FREE_ATTEMPTS) {
                const deducted = await deductCoins(ctx.from!.id, PRECHECK_PENALTY);
                if (deducted) {
                    penaltyMessage = `\n\n⚠️ ${ctx.t("precheck-penalty", { coins: PRECHECK_PENALTY })}`;
                }
            } else if (updatedUser) {
                const remaining = PRECHECK_FREE_ATTEMPTS - updatedUser.preCheckFails;
                if (remaining > 0) {
                    penaltyMessage = `\n\n💡 ${ctx.t("precheck-warning", { remaining })}`;
                }
            }
            
            await ctx.reply(ctx.t("photo-invalid", { error: validation.error || "Фото не соответствует требованиям" }) + penaltyMessage);
            return;
        }
        
        await resetPreCheckFails(ctx.from!.id);

        styleSessions.delete(ctx.from!.id);

        await deductCoins(ctx.from!.id, STYLE_COST);
        const updatedUser = await findUser(ctx.from!.id);

        const analyzingMsg = await ctx.reply(ui.analyzingStyle);

        const result = await analyzeStyle(
            photoUrl, 
            session.category, 
            session.customDescription,
            user.language as any
        );

        // Сохраняем результат
        styleAnalysisResults.set(ctx.from!.id, result);

        await ctx.api.deleteMessage(ctx.chat!.id, analyzingMsg.message_id);

        const s = result.scores;

        // Получаем текст коэффициента
        const getCoeffText = (coeff: number): string => {
            if (coeff >= 0.95) return `🌟 ${ui.perfectMatch}`;
            if (coeff >= 0.8) return `✨ ${ui.goodMatch}`;
            if (coeff >= 0.6) return `👍 ${ui.normalMatch}`;
            if (coeff >= 0.45) return `😐 ${ui.weakMatch}`;
            return `⚠️ ${ui.poorMatch}`;
        };

        // Формируем сообщение с результатом
        const resultMessage = `${ui.styleResultTitle}

🎯 ${ui.totalScore}: ${result.totalScore}/100
${getCoeffText(result.overallCoefficient)} (×${result.overallCoefficient.toFixed(2)})

📊 Детали:

${ui.colorHarmony}: ${s.colorHarmony}/100
${getProgressBar(s.colorHarmony)}

${ui.fit}: ${s.fit}/100
${getProgressBar(s.fit)}

${ui.styleConsistency}: ${s.styleConsistency}/100
${getProgressBar(s.styleConsistency)}

${ui.accessories}: ${s.accessories}/100
${getProgressBar(s.accessories)}

${ui.grooming}: ${s.grooming}/100
${getProgressBar(s.grooming)}

${ui.contextMatch}: ${s.contextMatch}/100
${getProgressBar(s.contextMatch)}

${ui.strengths}:
${result.strengths.map((s: string) => `✅ ${s}`).join("\n")}

${ui.improvements}:
${result.improvements.map((i: string) => `🔸 ${i}`).join("\n")}

${ui.recommendations}:
${result.recommendations.map((r: string) => `💡 ${r}`).join("\n")}

💎 ${ui.charged} ${STYLE_COST} coins
💎 ${ui.remaining} ${updatedUser?.coins ?? 0} coins`;

        const keyboard = new InlineKeyboard()
            .text(ui.rateAgainButton, "rate_style")
            .row()
            .text(ui.backToMenu, "back_menu");

        await ctx.reply(resultMessage, { reply_markup: keyboard });
    });

    // Очистка сессии при возврате в меню
    bot.callbackQuery("back_menu", async (ctx, next) => {
        styleSessions.delete(ctx.from!.id);
        awaitingCustomDescription.delete(ctx.from!.id);
        await next();
    });
};
