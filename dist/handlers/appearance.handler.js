import { InputFile, InlineKeyboard } from "grammy";
import { getServicesKeyboard, getBackKeyboard } from "../keyboards/index.js";
import { logAnalysis, notifyAdminAboutError } from "../utils/logger.js";
import { findUser, deductCoins, incrementPreCheckFails, resetPreCheckFails, PRECHECK_PENALTY, PRECHECK_FREE_ATTEMPTS } from "../services/user.service.js";
import { validatePhoto, analyzeAppearance, getImprovementTips, analysisResults, getTelegramFileUrl } from "../services/gpt.service.js";
import { APPEARANCE_COST, FRONT_PHOTO_EXAMPLE, SIDE_PHOTO_EXAMPLE } from "../constants/index.js";
import { getAppearanceUI } from "../translations/appearance.translations.js";
import "dotenv/config";
import * as process from "node:process";
const photoSessions = new Map();
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
export const appearanceHandler = (bot) => {
    bot.callbackQuery("get_started", async (ctx) => {
        await ctx.reply(ctx.t("get-started-info"), {
            reply_markup: getServicesKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("rate_appearance", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }
        if (user.coins < APPEARANCE_COST) {
            await ctx.reply(ctx.t("not-enough-coins", { balance: user.coins, required: APPEARANCE_COST }), { reply_markup: getBackKeyboard(ctx) });
            await ctx.answerCallbackQuery();
            return;
        }
        photoSessions.set(ctx.from.id, { stage: "front" });
        await ctx.replyWithPhoto(new InputFile(FRONT_PHOTO_EXAMPLE), {
            caption: ctx.t("send-front-photo"),
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.on("message:photo", async (ctx, next) => {
        const session = photoSessions.get(ctx.from.id);
        if (!session)
            return next();
        const user = await findUser(ctx.from.id);
        if (!user)
            return next();
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN, photo.file_id);
        if (!photoUrl) {
            await ctx.reply(ctx.t("photo-invalid", { error: "Не удалось загрузить фото" }));
            return;
        }
        const checkingMsg = await ctx.reply(ctx.t("checking-photo"));
        const validation = await validatePhoto(photoUrl, session.stage, (user.language || "EN"));
        await ctx.api.deleteMessage(ctx.chat.id, checkingMsg.message_id);
        if (!validation.isValid) {
            const updatedUser = await incrementPreCheckFails(ctx.from.id);
            let penaltyMessage = "";
            if (updatedUser && updatedUser.preCheckFails >= PRECHECK_FREE_ATTEMPTS) {
                const deducted = await deductCoins(ctx.from.id, PRECHECK_PENALTY);
                if (deducted) {
                    penaltyMessage = `\n\n⚠️ ${ctx.t("precheck-penalty", { coins: PRECHECK_PENALTY })}`;
                }
            }
            else if (updatedUser) {
                const remaining = PRECHECK_FREE_ATTEMPTS - updatedUser.preCheckFails;
                if (remaining > 0) {
                    penaltyMessage = `\n\n💡 ${ctx.t("precheck-warning", { remaining })}`;
                }
            }
            await ctx.reply(ctx.t("photo-invalid", { error: validation.error || "Фото не соответствует требованиям" }) + penaltyMessage);
            return;
        }
        await resetPreCheckFails(ctx.from.id);
        if (session.stage === "front") {
            session.frontPhotoUrl = photoUrl;
            session.stage = "side";
            photoSessions.set(ctx.from.id, session);
            await ctx.replyWithPhoto(new InputFile(SIDE_PHOTO_EXAMPLE), {
                caption: ctx.t("send-side-photo")
            });
        }
        else {
            photoSessions.delete(ctx.from.id);
            await deductCoins(ctx.from.id, APPEARANCE_COST);
            const updatedUser = await findUser(ctx.from.id);
            const analyzingMsg = await ctx.reply(ctx.t("analyzing"));
            try {
                const result = await analyzeAppearance(session.frontPhotoUrl, photoUrl, user.language);
                analysisResults.set(ctx.from.id, result);
                await logAnalysis(ctx.from.id, 'appearance', APPEARANCE_COST, true);
                await ctx.api.deleteMessage(ctx.chat.id, analyzingMsg.message_id);
                const s = result.scores;
                const ui = getAppearanceUI(updatedUser?.language || "EN");
                const getCoeffText = (coeff) => {
                    if (coeff >= 0.95)
                        return `🌟 ${ui.excellent}`;
                    if (coeff >= 0.85)
                        return `✨ ${ui.good}`;
                    if (coeff >= 0.75)
                        return `👍 ${ui.normal}`;
                    if (coeff >= 0.65)
                        return `😐 ${ui.average}`;
                    return `⚠️ ${ui.low}`;
                };
                const resultMessage = `✨ ${ctx.t("appearance-result-title")}

🎯 ${ui.totalScore}: ${result.totalScore}/100
${getCoeffText(result.overallCoefficient)} ${ui.impression} (×${result.overallCoefficient.toFixed(2)})

📊 ${ui.details}:

${ui.eyes}: ${s.eyes}/100
${getProgressBar(s.eyes)}

${ui.nose}: ${s.nose}/100
${getProgressBar(s.nose)}

${ui.lips}: ${s.lips}/100
${getProgressBar(s.lips)}

${ui.skin}: ${s.skin}/100
${getProgressBar(s.skin)}

${ui.jawline}: ${s.jawline}/100
${getProgressBar(s.jawline)}

${ui.cheekbones}: ${s.cheekbones}/100
${getProgressBar(s.cheekbones)}

${ui.symmetry}: ${s.symmetry}/100
${getProgressBar(s.symmetry)}

${ui.eyebrows}: ${s.eyebrows}/100
${getProgressBar(s.eyebrows)}

💎 ${ui.charged}: ${APPEARANCE_COST} coins
💎 ${ui.remaining}: ${updatedUser?.coins ?? 0} coins`;
                const keyboard = new InlineKeyboard()
                    .text(`💡 ${ui.tipsButton}`, "get_improvement_tips")
                    .row()
                    .text(`⬅️ ${ui.backButton}`, "back_menu");
                await ctx.reply(resultMessage, { reply_markup: keyboard });
            }
            catch (error) {
                await notifyAdminAboutError(error, 'appearance analysis', ctx.from.id);
                await ctx.api.deleteMessage(ctx.chat.id, analyzingMsg.message_id).catch(() => { });
                await ctx.reply(ctx.t("maintenance-mode"));
                return;
            }
        }
    });
    bot.callbackQuery("get_improvement_tips", async (ctx) => {
        const user = await findUser(ctx.from.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: "Пользователь не найден" });
            return;
        }
        const result = analysisResults.get(ctx.from.id);
        if (!result) {
            const ui = getAppearanceUI(user.language);
            await ctx.answerCallbackQuery({ text: ui.noAnalysisYet, show_alert: true });
            return;
        }
        await ctx.answerCallbackQuery();
        const ui = getAppearanceUI(user.language);
        const loadingMsg = await ctx.reply(ui.generatingTips);
        const tips = await getImprovementTips(result, user.language);
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        const tipsMessage = `${ui.tipsTitle}

${tips}`;
        await ctx.reply(tipsMessage, {
            parse_mode: "Markdown",
            reply_markup: new InlineKeyboard().text(ui.backToMenu, "back_menu")
        });
    });
    bot.callbackQuery("back_menu", async (ctx, next) => {
        photoSessions.delete(ctx.from.id);
        await next();
    });
};
//# sourceMappingURL=appearance.handler.js.map