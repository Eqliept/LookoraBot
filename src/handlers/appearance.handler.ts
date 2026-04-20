import type { Bot } from "grammy";
import { InputFile, InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getServicesKeyboard, getBackKeyboard, getMainMenuKeyboard } from "../keyboards/index.js";
import { logAnalysis, notifyAdminAboutError } from "../utils/logger.js";
import { findUser, deductCoins, incrementPreCheckFails, resetPreCheckFails, PRECHECK_PENALTY, PRECHECK_FREE_ATTEMPTS } from "../services/user.service.js";
import { validatePhoto, analyzeAppearance, getImprovementTips, analysisResults, getTelegramFileUrl } from "../services/gpt.service.js";
import type { UserPhotoSession } from "../types/index.js";
import { APPEARANCE_COST, TIPS_COST, FRONT_PHOTO_EXAMPLE, SIDE_PHOTO_EXAMPLE, MAIN_IMAGE } from "../constants/index.js";
import { getAppearanceUI } from "../translations/appearance.translations.js";
import "dotenv/config";
import * as process from "node:process";

const photoSessions = new Map<number, UserPhotoSession>();

const getProgressBar = (value: number): string => {
    const filled = Math.round(value / 10);
    const empty = 10 - filled;
    return "▓".repeat(filled) + "░".repeat(empty);
};

const getRatingEmoji = (value: number): string => {
    if (value >= 85) return "🌟";
    if (value >= 70) return "✨";
    if (value >= 55) return "👍";
    return "📊";
};

export const appearanceHandler = (bot: Bot<MyContext>) => {
    bot.callbackQuery("get_started", async (ctx) => {
        await ctx.reply(ctx.t("get-started-info"), {
            reply_markup: getServicesKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("rate_appearance", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        if (user.coins < APPEARANCE_COST) {
            await ctx.reply(
                ctx.t("not-enough-coins", { balance: user.coins, required: APPEARANCE_COST }),
                { reply_markup: getBackKeyboard(ctx) }
            );
            await ctx.answerCallbackQuery();
            return;
        }

        photoSessions.set(ctx.from!.id, { stage: "front" });

        await ctx.replyWithPhoto(new InputFile(FRONT_PHOTO_EXAMPLE), {
            caption: ctx.t("send-front-photo"),
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.on("message:photo", async (ctx, next) => {
        const session = photoSessions.get(ctx.from!.id);
        if (!session) return next();

        const user = await findUser(ctx.from!.id);
        if (!user) return next();

        const photo = ctx.message.photo[ctx.message.photo.length - 1]!;
        const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN!, photo.file_id);

        if (!photoUrl) {
            await ctx.reply(ctx.t("photo-invalid", { error: "Не удалось загрузить фото" }));
            return;
        }

        const checkingMsg = await ctx.reply(ctx.t("checking-photo"));

        const validation = await validatePhoto(photoUrl, session.stage, (user.language || "EN") as any);

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

        if (session.stage === "front") {
            session.frontPhotoUrl = photoUrl;
            session.stage = "side";
            photoSessions.set(ctx.from!.id, session);

            await ctx.replyWithPhoto(new InputFile(SIDE_PHOTO_EXAMPLE), {
                caption: ctx.t("send-side-photo")
            });
        } else {
            photoSessions.delete(ctx.from!.id);

            await deductCoins(ctx.from!.id, APPEARANCE_COST);
            const updatedUser = await findUser(ctx.from!.id);

            const analyzingMsg = await ctx.reply(ctx.t("analyzing"));

            try {
                const result = await analyzeAppearance(session.frontPhotoUrl!, photoUrl, user.language as any);

                analysisResults.set(ctx.from!.id, result);

                await logAnalysis(ctx.from!.id, 'appearance', APPEARANCE_COST, true);

                await ctx.api.deleteMessage(ctx.chat!.id, analyzingMsg.message_id);

                const s = result.scores;
                const ui = getAppearanceUI(updatedUser?.language as any || "EN");

                const getCoeffText = (coeff: number): string => {
                    if (coeff >= 0.95) return `🌟 ${ui.excellent}`;
                    if (coeff >= 0.85) return `✨ ${ui.good}`;
                    if (coeff >= 0.75) return `👍 ${ui.normal}`;
                    if (coeff >= 0.65) return `😐 ${ui.average}`;
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
                    .text(`� ${ui.looksMaxingButton}`, "get_looksmax_rating")
                    .row()
                    .text(`💡 ${ui.tipsButton}`, "get_improvement_tips")
                    .row()
                    .text(`🔄 ${ui.rateAgainButton}`, "rate_appearance")
                    .row()
                    .text(`⬅️ ${ui.backButton}`, "back_menu");

                await ctx.reply(resultMessage, { reply_markup: keyboard });
            } catch (error) {
                await notifyAdminAboutError(error as Error, 'appearance analysis', ctx.from!.id);
                await ctx.api.deleteMessage(ctx.chat!.id, analyzingMsg.message_id).catch(() => {});
                await ctx.reply(ctx.t("maintenance-mode"));
                return;
            }
        }
    });

    bot.callbackQuery("get_improvement_tips", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: "Пользователь не найден" });
            return;
        }

        const result = analysisResults.get(ctx.from!.id);
        if (!result) {
            const ui = getAppearanceUI(user.language as any);
            await ctx.answerCallbackQuery({ text: ui.noAnalysisYet, show_alert: true });
            return;
        }

        await ctx.answerCallbackQuery();
        const ui = getAppearanceUI(user.language as any);
        const loadingMsg = await ctx.reply(ui.generatingTips);

        const tips = await getImprovementTips(result, user.language as any);

        await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

        const tipsMessage = `${ui.tipsTitle}

${tips}`;

        await ctx.reply(tipsMessage, {
            parse_mode: "Markdown",
            reply_markup: new InlineKeyboard().text(ui.backToMenu, "back_menu")
        });
    });

    bot.callbackQuery("get_looksmax_rating", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: "User not found" });
            return;
        }

        const result = analysisResults.get(ctx.from!.id);
        if (!result) {
            const ui = getAppearanceUI(user.language as any);
            await ctx.answerCallbackQuery({ text: ui.noAnalysisYet, show_alert: true });
            return;
        }

        await ctx.answerCallbackQuery();
        const ui = getAppearanceUI(user.language as any);

        const score = result.totalScore;
        const getLooksMaxTier = (score: number, lang: string) => {

            const tiers: Record<string, { tier: string; emoji: string; desc: Record<string, string> }> = {
                gigachad: {
                    tier: "GIGACHAD",
                    emoji: "👑💎",
                    desc: {
                        RU: "Топ 1% внешности. Генетический джекпот. Модельный уровень, притягивает взгляды везде.",
                        EN: "Top 1% looks. Genetic jackpot. Model-tier, draws attention everywhere.",
                        ES: "Top 1% de apariencia. Premio genético. Nivel de modelo, atrae miradas en todas partes.",
                        FR: "Top 1% d'apparence. Jackpot génétique. Niveau mannequin, attire les regards partout.",
                        PT: "Top 1% de aparência. Jackpot genético. Nível modelo, atrai olhares em todos os lugares.",
                        UA: "Топ 1% зовнішності. Генетичний джекпот. Модельний рівень, притягує погляди всюди."
                    }
                },
                chad: {
                    tier: "CHAD",
                    emoji: "🔥💪",
                    desc: {
                        RU: "Топ 5% мужчин. Очень привлекательный, сильная челюсть, симметричное лицо. Легко привлекает внимание.",
                        EN: "Top 5% of men. Very attractive, strong jawline, symmetrical face. Easily draws attention.",
                        ES: "Top 5% de hombres. Muy atractivo, mandíbula fuerte, cara simétrica. Atrae fácilmente la atención.",
                        FR: "Top 5% des hommes. Très attirant, mâchoire forte, visage symétrique. Attire facilement l'attention.",
                        PT: "Top 5% dos homens. Muito atraente, mandíbula forte, rosto simétrico. Atrai atenção facilmente.",
                        UA: "Топ 5% чоловіків. Дуже привабливий, сильна щелепа, симетричне обличчя. Легко привертає увагу."
                    }
                },
                chadlite: {
                    tier: "CHADLITE",
                    emoji: "✨😎",
                    desc: {
                        RU: "Топ 15%. Выше среднего, хорошие черты лица. С правильным стилем и уходом может конкурировать с Chad.",
                        EN: "Top 15%. Above average, good facial features. With right style and grooming can compete with Chad.",
                        ES: "Top 15%. Por encima del promedio, buenos rasgos faciales. Con estilo y cuidado correcto puede competir con Chad.",
                        FR: "Top 15%. Au-dessus de la moyenne, bons traits du visage. Avec le bon style et soin peut rivaliser avec Chad.",
                        PT: "Top 15%. Acima da média, boas características faciais. Com estilo e cuidado certo pode competir com Chad.",
                        UA: "Топ 15%. Вище середнього, гарні риси обличчя. З правильним стилем і доглядом може конкурувати з Chad."
                    }
                },
                htn: {
                    tier: "HTN (High Tier Normie)",
                    emoji: "👍😊",
                    desc: {
                        RU: "Топ 30%. Привлекательный нормис. Хорошая внешность, приятные черты. Лукмаксинг может поднять до Chadlite.",
                        EN: "Top 30%. Attractive normie. Good looks, pleasant features. Looksmaxxing can elevate to Chadlite.",
                        ES: "Top 30%. Normie atractivo. Buena apariencia, rasgos agradables. Looksmaxxing puede elevar a Chadlite.",
                        FR: "Top 30%. Normie attractif. Belle apparence, traits agréables. Le looksmaxxing peut élever à Chadlite.",
                        PT: "Top 30%. Normie atraente. Boa aparência, traços agradáveis. Looksmaxxing pode elevar a Chadlite.",
                        UA: "Топ 30%. Привабливий норміс. Гарна зовнішність, приємні риси. Лукмаксинг може підняти до Chadlite."
                    }
                },
                mtn: {
                    tier: "MTN (Mid Tier Normie)",
                    emoji: "😐👤",
                    desc: {
                        RU: "Средний уровень. Обычная внешность, ни плохо ни хорошо. Есть потенциал для улучшения через лукмаксинг.",
                        EN: "Average level. Normal appearance, neither bad nor good. Has potential for improvement through looksmaxxing.",
                        ES: "Nivel medio. Apariencia normal, ni mala ni buena. Tiene potencial de mejora a través del looksmaxxing.",
                        FR: "Niveau moyen. Apparence normale, ni mauvaise ni bonne. A un potentiel d'amélioration par le looksmaxxing.",
                        PT: "Nível médio. Aparência normal, nem ruim nem boa. Tem potencial de melhoria através do looksmaxxing.",
                        UA: "Середній рівень. Звичайна зовнішність, ні погано ні добре. Є потенціал для покращення через лукмаксинг."
                    }
                },
                ltn: {
                    tier: "LTN (Low Tier Normie)",
                    emoji: "😕📉",
                    desc: {
                        RU: "Ниже среднего. Есть заметные недостатки. Требуется серьёзный лукмаксинг: уход, стиль, возможно хирургия.",
                        EN: "Below average. Has noticeable flaws. Requires serious looksmaxxing: grooming, style, possibly surgery.",
                        ES: "Por debajo del promedio. Tiene defectos notables. Requiere looksmaxxing serio: cuidado, estilo, posiblemente cirugía.",
                        FR: "En dessous de la moyenne. A des défauts notables. Nécessite un looksmaxxing sérieux: soins, style, peut-être chirurgie.",
                        PT: "Abaixo da média. Tem falhas notáveis. Requer looksmaxxing sério: cuidados, estilo, possivelmente cirurgia.",
                        UA: "Нижче середнього. Є помітні недоліки. Потрібен серйозний лукмаксинг: догляд, стиль, можливо хірургія."
                    }
                },
                subhuman: {
                    tier: "SUBHUMAN",
                    emoji: "😢⚠️",
                    desc: {
                        RU: "Значительно ниже среднего. Серьёзные эстетические проблемы. Максимальный фокус на лукмаксинг и self-improvement.",
                        EN: "Significantly below average. Serious aesthetic issues. Maximum focus on looksmaxxing and self-improvement.",
                        ES: "Significativamente por debajo del promedio. Problemas estéticos serios. Enfoque máximo en looksmaxxing y automejora.",
                        FR: "Significativement en dessous de la moyenne. Problèmes esthétiques sérieux. Focus maximum sur le looksmaxxing et l'amélioration personnelle.",
                        PT: "Significativamente abaixo da média. Problemas estéticos sérios. Foco máximo em looksmaxxing e automelhoria.",
                        UA: "Значно нижче середнього. Серйозні естетичні проблеми. Максимальний фокус на лукмаксинг та self-improvement."
                    }
                }
            };

            let tierKey: string;
            if (score >= 90) tierKey = "gigachad";
            else if (score >= 80) tierKey = "chad";
            else if (score >= 70) tierKey = "chadlite";
            else if (score >= 60) tierKey = "htn";
            else if (score >= 50) tierKey = "mtn";
            else if (score >= 40) tierKey = "ltn";
            else tierKey = "subhuman";

            const tier = tiers[tierKey]!;
            return {
                name: tier.tier,
                emoji: tier.emoji,
                description: tier.desc[lang as keyof typeof tier.desc] || tier.desc.EN
            };
        };

        const tier = getLooksMaxTier(score, user.language || "EN");

        const message = `${ui.looksMaxingTitle}

${tier.emoji} ${ui.looksMaxingTier}: ${tier.name}
📊 ${ui.totalScore}: ${score}/100

📝 ${ui.looksMaxingDescription}:
${tier.description}`;

        await ctx.reply(message, {
            reply_markup: new InlineKeyboard()
                .text(`💡 ${ui.tipsButton}`, "get_improvement_tips")
                .row()
                .text(ui.backToMenu, "back_menu")
        });
    });

    bot.callbackQuery("back_menu", async (ctx, next) => {
        photoSessions.delete(ctx.from!.id);
        await next();
    });
};
