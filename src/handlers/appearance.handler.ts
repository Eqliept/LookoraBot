import type { Bot } from "grammy";
import { InputFile, InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { getServicesKeyboard, getBackKeyboard, getMainMenuKeyboard } from "../keyboards/index.ts";
import { findUser } from "../services/user.service.ts";
import { validatePhoto, analyzeAppearance, getImprovementTips, analysisResults, getTelegramFileUrl } from "../services/gpt.service.ts";
import type { UserPhotoSession } from "../types/index.ts";
import { APPEARANCE_COST, TIPS_COST, FRONT_PHOTO_EXAMPLE, SIDE_PHOTO_EXAMPLE, MAIN_IMAGE } from "../constants/index.ts";
import { getAppearanceUI } from "../translations/appearance.translations.ts";
import "dotenv/config";

const photoSessions = new Map<number, UserPhotoSession>();

// Функция для создания прогресс-бара
const getProgressBar = (value: number): string => {
    const filled = Math.round(value / 10);
    const empty = 10 - filled;
    return "▓".repeat(filled) + "░".repeat(empty);
};

// Функция для получения эмодзи рейтинга
const getRatingEmoji = (value: number): string => {
    if (value >= 85) return "🌟";
    if (value >= 70) return "✨";
    if (value >= 55) return "👍";
    return "📊";
};

export const appearanceHandler = (bot: Bot<MyContext>) => {
    // Кнопка "Начать" -> Меню выбора услуги
    bot.callbackQuery("get_started", async (ctx) => {
        await ctx.reply(ctx.t("get-started-info"), {
            reply_markup: getServicesKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Оценить внешность
    bot.callbackQuery("rate_appearance", async (ctx) => {
        const user = findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        // Проверяем баланс
        if (user.coins < APPEARANCE_COST) {
            await ctx.reply(
                ctx.t("not-enough-coins", { balance: user.coins, required: APPEARANCE_COST }),
                { reply_markup: getBackKeyboard(ctx) }
            );
            await ctx.answerCallbackQuery();
            return;
        }

        // Начинаем сессию сбора фото
        photoSessions.set(ctx.from!.id, { stage: "front" });

        // Отправляем пример фото спереди
        await ctx.replyWithPhoto(new InputFile(FRONT_PHOTO_EXAMPLE), {
            caption: ctx.t("send-front-photo"),
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Оценить и улучшить стиль (заглушка)
    bot.callbackQuery("rate_style", async (ctx) => {
        await ctx.answerCallbackQuery({ text: ctx.t("style-coming-soon"), show_alert: true });
    });

    // Обработка фото
    bot.on("message:photo", async (ctx) => {
        const session = photoSessions.get(ctx.from!.id);
        if (!session) return;

        const user = findUser(ctx.from!.id);
        if (!user) return;

        // Получаем URL фото
        const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Максимальное разрешение
        const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN!, photo.file_id);

        if (!photoUrl) {
            await ctx.reply(ctx.t("photo-invalid", { error: "Не удалось загрузить фото" }));
            return;
        }

        // Показываем статус проверки
        const checkingMsg = await ctx.reply(ctx.t("checking-photo"));

        // Проверяем качество фото через GPT Vision
        const validation = await validatePhoto(photoUrl, session.stage, user.language);

        // Удаляем сообщение о проверке
        await ctx.api.deleteMessage(ctx.chat!.id, checkingMsg.message_id);

        if (!validation.isValid) {
            await ctx.reply(ctx.t("photo-invalid", { error: validation.error || "Фото не соответствует требованиям" }));
            return;
        }

        if (session.stage === "front") {
            // Сохраняем первое фото и просим второе (боковое)
            session.frontPhotoUrl = photoUrl;
            session.stage = "side";
            photoSessions.set(ctx.from!.id, session);

            // Отправляем пример бокового фото
            await ctx.replyWithPhoto(new InputFile(SIDE_PHOTO_EXAMPLE), {
                caption: ctx.t("send-side-photo")
            });
        } else {
            // Оба фото получены, выполняем анализ
            photoSessions.delete(ctx.from!.id);

            user.coins -= APPEARANCE_COST;

            const analyzingMsg = await ctx.reply(ctx.t("analyzing"));

            const result = await analyzeAppearance(session.frontPhotoUrl!, photoUrl, user.language);
            
            // Сохраняем результат для генерации советов
            analysisResults.set(ctx.from!.id, result);

            await ctx.api.deleteMessage(ctx.chat!.id, analyzingMsg.message_id);

            const s = result.scores;
            const ui = getAppearanceUI(user.language);
            
            // Получаем текст коэффициента
            const getCoeffText = (coeff: number): string => {
                if (coeff >= 0.95) return `🌟 ${ui.excellent}`;
                if (coeff >= 0.85) return `✨ ${ui.good}`;
                if (coeff >= 0.75) return `👍 ${ui.normal}`;
                if (coeff >= 0.65) return `😐 ${ui.average}`;
                return `⚠️ ${ui.low}`;
            };
            
            // Формируем детализированное сообщение
            const resultMessage = `✨ ${ctx.t("appearance-result-title")}

🎯 ${ui.totalScore}: ${result.totalScore}/100
${getCoeffText(result.overallCoefficient)} ${ui.impression} (×${result.overallCoefficient.toFixed(2)})

📊 ${ui.details}:

${getRatingEmoji(s.eyes)} ${ui.eyes}: ${s.eyes}/100
${getProgressBar(s.eyes)}

${getRatingEmoji(s.nose)} ${ui.nose}: ${s.nose}/100
${getProgressBar(s.nose)}

${getRatingEmoji(s.lips)} ${ui.lips}: ${s.lips}/100
${getProgressBar(s.lips)}

${getRatingEmoji(s.skin)} ${ui.skin}: ${s.skin}/100
${getProgressBar(s.skin)}

${getRatingEmoji(s.jawline)} ${ui.jawline}: ${s.jawline}/100
${getProgressBar(s.jawline)}

${getRatingEmoji(s.cheekbones)} ${ui.cheekbones}: ${s.cheekbones}/100
${getProgressBar(s.cheekbones)}

${getRatingEmoji(s.symmetry)} ${ui.symmetry}: ${s.symmetry}/100
${getProgressBar(s.symmetry)}

${getRatingEmoji(s.harmony)} ${ui.harmony}: ${s.harmony}/100
${getProgressBar(s.harmony)}

💎 ${ui.charged}: ${APPEARANCE_COST} coins
💎 ${ui.remaining}: ${user.coins} coins`;

            const keyboard = new InlineKeyboard()
                .text(`💡 ${ui.tipsButton} (${TIPS_COST})`, "get_improvement_tips")
                .row()
                .text(`⬅️ ${ui.backButton}`, "back_menu");

            await ctx.reply(resultMessage, { reply_markup: keyboard });
        }
    });

    // Обработчик кнопки советов
    bot.callbackQuery("get_improvement_tips", async (ctx) => {
        const user = findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: "Пользователь не найден" });
            return;
        }

        const result = analysisResults.get(ctx.from!.id);
        if (!result) {
            const ui = getAppearanceUI(user.language);
            await ctx.answerCallbackQuery({ text: ui.noAnalysisYet, show_alert: true });
            return;
        }

        if (user.coins < TIPS_COST) {
            const ui = getAppearanceUI(user.language);
            await ctx.answerCallbackQuery({ 
                text: `${ui.notEnoughCoins} ${TIPS_COST}, ${ui.youHave} ${user.coins}`, 
                show_alert: true 
            });
            return;
        }

        user.coins -= TIPS_COST;

        await ctx.answerCallbackQuery();
        const ui = getAppearanceUI(user.language);
        const loadingMsg = await ctx.reply(ui.generatingTips);

        const tips = await getImprovementTips(result, user.language);

        await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

        const tipsMessage = `${ui.tipsTitle}

${tips}

💎 ${ui.charged} ${TIPS_COST} ${ui.lookCoins}
💎 ${ui.remaining} ${user.coins} ${ui.lookCoins}`;

        await ctx.reply(tipsMessage, { 
            reply_markup: new InlineKeyboard().text(ui.backToMenu, "back_menu") 
        });
    });

    bot.callbackQuery("back_menu", async (ctx, next) => {
        photoSessions.delete(ctx.from!.id);
        await next();
    });
};
