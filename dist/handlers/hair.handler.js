import { InlineKeyboard } from "grammy";
import { getBackKeyboard } from "../keyboards/index.js";
import { logAnalysis } from "../utils/logger.js";
import { findUser, deductCoins, incrementPreCheckFails, resetPreCheckFails, PRECHECK_PENALTY, PRECHECK_FREE_ATTEMPTS } from "../services/user.service.js";
import { validatePhoto, analyzeHair, suggestHairstyle, improveCurrentHair, generateBarberInstructions, getTelegramFileUrl } from "../services/gpt.service.js";
import { getHairUI } from "../translations/hair.translations.js";
import "dotenv/config";
import * as process from "node:process";
const HAIR_COST = 75;
const hairAnalysisResults = new Map();
const getProgressBar = (value) => {
    const filled = Math.round(value / 10);
    const empty = 10 - filled;
    return "▓".repeat(filled) + "░".repeat(empty);
};
const getRatingEmoji = (value) => {
    if (value >= 85)
        return "🌟";
    if (value >= 70)
        return "✨";
    if (value >= 55)
        return "👍";
    return "📊";
};
export const hairHandler = (bot) => {
    // Начало оценки волос
    bot.callbackQuery("rate_hair", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }
        if (user.coins < HAIR_COST) {
            await ctx.reply(ctx.t("not-enough-coins", { balance: user.coins, required: HAIR_COST }), { reply_markup: getBackKeyboard(ctx) });
            await ctx.answerCallbackQuery();
            return;
        }
        await ctx.reply(ctx.t("hair-upload-photo"), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    // Обработка загруженного фото для анализа волос
    bot.on("message:photo", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user)
            return;
        // Проверяем контекст - ожидаем ли мы фото для волос
        const lastMessage = await ctx.api.getChat(ctx.chat.id);
        try {
            const photo = ctx.message.photo?.[ctx.message.photo.length - 1];
            if (!photo)
                return;
            const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN, photo.file_id);
            if (!photoUrl) {
                await ctx.reply(ctx.t("error-occurred"));
                return;
            }
            const loadingMsg = await ctx.reply(ctx.t("hair-analyzing"));
            // Валидация фото (используем проверку front, т.к. нужно видеть волосы и лицо)
            const validation = await validatePhoto(photoUrl, "front", (user.language || "EN"));
            if (!validation.isValid) {
                await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
                const currentFails = user.preCheckFails || 0;
                if (currentFails < PRECHECK_FREE_ATTEMPTS) {
                    await incrementPreCheckFails(Number(user.id));
                    const remainingFree = PRECHECK_FREE_ATTEMPTS - currentFails - 1;
                    await ctx.reply(ctx.t("hair-validation-failed-free", {
                        error: validation.error || "Invalid photo",
                        remaining: remainingFree
                    }), { reply_markup: getBackKeyboard(ctx) });
                }
                else {
                    const newBalance = await deductCoins(Number(user.id), PRECHECK_PENALTY);
                    await incrementPreCheckFails(Number(user.id));
                    await ctx.reply(ctx.t("hair-validation-failed-paid", {
                        error: validation.error || "Invalid photo",
                        penalty: PRECHECK_PENALTY,
                        balance: newBalance ? user.coins - PRECHECK_PENALTY : 0
                    }), { reply_markup: getBackKeyboard(ctx) });
                }
                return;
            }
            // Списываем койны и анализируем
            const newBalance = await deductCoins(Number(user.id), HAIR_COST);
            await resetPreCheckFails(Number(user.id));
            const analysisResult = await analyzeHair(photoUrl, (user.language || "EN"));
            // Сохраняем результат для дальнейших действий
            hairAnalysisResults.set(user.id, { result: analysisResult, photoUrl });
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            // Формируем сообщение с результатами
            const ui = getHairUI((user.language || "EN"));
            const scores = analysisResult.scores;
            let message = `${getRatingEmoji(analysisResult.totalScore)} **${ui.totalScore}: ${analysisResult.totalScore}/100**\n\n`;
            message += `**${ui.faceShape}:** ${analysisResult.faceShape}\n`;
            message += `**${ui.currentStyle}:** ${analysisResult.currentStyle}\n\n`;
            message += `**${ui.details}:**\n`;
            message += `${ui.health} ${scores.health}/100 ${getProgressBar(scores.health)}\n`;
            message += `${ui.volume} ${scores.volume}/100 ${getProgressBar(scores.volume)}\n`;
            message += `${ui.texture} ${scores.texture}/100 ${getProgressBar(scores.texture)}\n`;
            message += `${ui.color} ${scores.color}/100 ${getProgressBar(scores.color)}\n`;
            message += `${ui.styling} ${scores.styling}/100 ${getProgressBar(scores.styling)}\n`;
            message += `${ui.maintenance} ${scores.maintenance}/100 ${getProgressBar(scores.maintenance)}\n\n`;
            if (analysisResult.strengths.length > 0) {
                message += `**${ui.strengths}:**\n`;
                analysisResult.strengths.forEach(s => message += `• ${s}\n`);
                message += `\n`;
            }
            if (analysisResult.improvements.length > 0) {
                message += `**${ui.improvements}:**\n`;
                analysisResult.improvements.forEach(i => message += `• ${i}\n`);
            }
            message += `\n💎 ${ctx.t("balance")}: ${newBalance ? user.coins - HAIR_COST : 0} ${ctx.t("look-coins")}`;
            const keyboard = new InlineKeyboard()
                .text(ui.suggestHairstyleButton, "hair_suggest")
                .row()
                .text(ui.improveCurrentButton, "hair_improve")
                .row()
                .text(ui.backButton, "back_menu");
            await ctx.reply(message, {
                parse_mode: "Markdown",
                reply_markup: keyboard
            });
            await logAnalysis(Number(user.telegramId), "style", // используем style т.к. hair еще нет в типах
            HAIR_COST, true, { hairScore: analysisResult.totalScore });
        }
        catch (error) {
            console.error("Hair analysis error:", error);
            await ctx.reply(ctx.t("error-occurred"), {
                reply_markup: getBackKeyboard(ctx)
            });
        }
    });
    // Подбор прически
    bot.callbackQuery("hair_suggest", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user)
            return;
        const analysis = hairAnalysisResults.get(user.id);
        if (!analysis) {
            await ctx.answerCallbackQuery({ text: ctx.t("no-analysis-yet") });
            return;
        }
        const ui = getHairUI((user.language || "EN"));
        const loadingMsg = await ctx.reply(ui.generatingSuggestion);
        try {
            const suggestion = await suggestHairstyle(analysis.photoUrl, analysis.result, (user.language || "EN"));
            // Сохраняем suggestion для кнопки барбера
            analysis.suggestion = suggestion;
            hairAnalysisResults.set(user.id, analysis);
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            const keyboard = new InlineKeyboard()
                .text(ui.barberInstructionsButton, "hair_barber")
                .row()
                .text(ui.backToHairMenu, "back_menu");
            await ctx.reply(`${ui.hairstyleSuggestionTitle}\n\n${suggestion}`, {
                parse_mode: "Markdown",
                reply_markup: keyboard
            });
        }
        catch (error) {
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(ctx.t("error-occurred"));
        }
        await ctx.answerCallbackQuery();
    });
    // Как улучшить текущую прическу
    bot.callbackQuery("hair_improve", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user)
            return;
        const analysis = hairAnalysisResults.get(user.id);
        if (!analysis) {
            await ctx.answerCallbackQuery({ text: ctx.t("no-analysis-yet") });
            return;
        }
        const ui = getHairUI((user.language || "EN"));
        const loadingMsg = await ctx.reply(ui.generatingImprovement);
        try {
            const improvements = await improveCurrentHair(analysis.photoUrl, analysis.result, (user.language || "EN"));
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            const keyboard = new InlineKeyboard()
                .text(ui.backToHairMenu, "back_menu");
            await ctx.reply(`${ui.improvementTitle}\n\n${improvements}`, {
                parse_mode: "Markdown",
                reply_markup: keyboard
            });
        }
        catch (error) {
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(ctx.t("error-occurred"));
        }
        await ctx.answerCallbackQuery();
    });
    // Текст для барбера
    bot.callbackQuery("hair_barber", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user)
            return;
        const analysis = hairAnalysisResults.get(user.id);
        if (!analysis || !analysis.suggestion) {
            await ctx.answerCallbackQuery({ text: ctx.t("no-suggestion-yet") });
            return;
        }
        const ui = getHairUI((user.language || "EN"));
        const loadingMsg = await ctx.reply(ui.generatingBarberText);
        try {
            const barberText = await generateBarberInstructions(analysis.suggestion, (user.language || "EN"));
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            const keyboard = new InlineKeyboard()
                .text(ui.backToHairMenu, "back_menu");
            await ctx.reply(`${ui.barberInstructionsTitle}\n\n${barberText}`, {
                parse_mode: "Markdown",
                reply_markup: keyboard
            });
        }
        catch (error) {
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(ctx.t("error-occurred"));
        }
        await ctx.answerCallbackQuery();
    });
};
//# sourceMappingURL=hair.handler.js.map