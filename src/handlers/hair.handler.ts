import type { Bot } from "grammy";
import { InlineKeyboard, InputFile } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getMainMenuKeyboard, getBackKeyboard } from "../keyboards/index.js";
import { logAnalysis, notifyAdminAboutError } from "../utils/logger.js";
import { findUser, deductCoins, incrementPreCheckFails, resetPreCheckFails, PRECHECK_PENALTY, PRECHECK_FREE_ATTEMPTS } from "../services/user.service.js";
import { validatePhoto, analyzeHair, suggestHairstyle, improveCurrentHair, generateBarberInstructions, getTelegramFileUrl } from "../services/gpt.service.js";
import { getHairUI } from "../translations/hair.translations.js";
import type { HairAnalysisResult, Language } from "../types/index.js";
import { FRONT_PHOTO_EXAMPLE, SIDE_PHOTO_EXAMPLE } from "../constants/index.js";
import "dotenv/config";
import * as process from "node:process";

const HAIR_COST = 75;

interface HairAnalysisData {
    result: HairAnalysisResult;
    photoUrl: string;
    suggestion?: string;
    gender?: "male" | "female";
    usedButtons: {
        suggest: boolean;
        improve: boolean;
        barber: boolean;
    };
}

const hairAnalysisResults = new Map<string, HairAnalysisData>();
const hairPhotoSessions = new Map<number, { frontPhotoUrl?: string; sidePhotoUrl?: string }>();

const translateFaceShape = (shape: string, lang: Language): string => {
    const shapeTranslations: Record<string, Record<Language, string>> = {
        "oval": { RU: "Овальная", EN: "Oval", UA: "Овальна", ES: "Ovalada", PT: "Oval", FR: "Ovale" },
        "round": { RU: "Круглая", EN: "Round", UA: "Кругла", ES: "Redonda", PT: "Redonda", FR: "Ronde" },
        "square": { RU: "Квадратная", EN: "Square", UA: "Квадратна", ES: "Cuadrada", PT: "Quadrada", FR: "Carrée" },
        "heart": { RU: "Сердцевидная", EN: "Heart", UA: "Серцеподібна", ES: "Corazón", PT: "Coração", FR: "Cœur" },
        "diamond": { RU: "Ромбовидная", EN: "Diamond", UA: "Ромбоподібна", ES: "Diamante", PT: "Diamante", FR: "Diamant" },
        "oblong": { RU: "Продолговатая", EN: "Oblong", UA: "Довгаста", ES: "Oblonga", PT: "Oblonga", FR: "Oblongue" },
        "triangle": { RU: "Треугольная", EN: "Triangle", UA: "Трикутна", ES: "Triángulo", PT: "Triângulo", FR: "Triangle" }
    };

    const lowerShape = shape.toLowerCase();
    for (const [key, translations] of Object.entries(shapeTranslations)) {
        if (lowerShape.includes(key)) {
            return translations[lang] || shape;
        }
    }
    return shape;
};

const getFrontPhotoText = (lang: Language): string => {
    const texts = {
        RU: `💇 ОЦЕНКА ВОЛОС (1/2)

📸 Загрузите фото лица СПЕРЕДИ:
• Лицо полностью видно
• Волосы хорошо видны
• Смотрите прямо в камеру

⚠️ Важно:
• Четкое фото
• Хорошее освещение
• Прямой ракурс`,
        EN: `💇 HAIR ASSESSMENT (1/2)

📸 Upload FRONT VIEW photo:
• Full face
• Hair clearly visible
• Looking at camera

⚠️ Important:
• Photo must be clear
• Good lighting
• Direct angle`,
        UA: `💇 ОЦІНКА ВОЛОССЯ (1/2)

📸 Завантажте фото ВИД СПЕРЕДУ:
• Обличчя повністю
• Волосся добре видно
• Погляд в камеру

⚠️ Важливо:
• Фото має бути чітким
• Хороше освітлення
• Прямий ракурс`,
        ES: `💇 EVALUACIÓN DE CABELLO (1/2)

📸 Sube foto VISTA FRONTAL:
• Rostro completo
• Cabello claramente visible
• Mirando a la cámara

⚠️ Importante:
• Foto nítida
• Buena iluminación
• Ángulo directo`,
        PT: `💇 AVALIAÇÃO DE CABELO (1/2)

📸 Envie foto VISTA FRONTAL:
• Rosto completo
• Cabelo claramente visível
• Olhando para câmera

⚠️ Importante:
• Foto nítida
• Boa iluminação
• Ângulo direto`,
        FR: `💇 ÉVALUATION CHEVEUX (1/2)

📸 Téléchargez photo VUE DE FACE:
• Visage complet
• Cheveux clairement visibles
• Regard vers caméra

⚠️ Important:
• Photo nette
• Bon éclairage
• Angle direct`
    };
    return texts[lang] || texts.EN;
};

const getSidePhotoText = (lang: Language): string => {
    const texts = {
        RU: `💇 ОЦЕНКА ВОЛОС (2/2)

📸 Теперь загрузите фото ВИД СБОКУ:
• Профиль (90°)
• Волосы хорошо видны
• Вся прическа в кадре

⚠️ Важно:
• Боковой ракурс
• Хорошее освещение
• Четкое фото`,
        EN: `💇 HAIR ASSESSMENT (2/2)

📸 Now upload SIDE VIEW photo:
• Profile (90°)
• Hair clearly visible
• Full hairstyle in frame

⚠️ Important:
• Side angle
• Good lighting
• Clear photo`,
        UA: `💇 ОЦІНКА ВОЛОССЯ (2/2)

📸 Тепер завантажте фото ВИД ЗБОКУ:
• Профіль (90°)
• Волосся добре видно
• Вся зачіска в кадрі

⚠️ Важливо:
• Боковий ракурс
• Хороше освітлення
• Чітке фото`,
        ES: `💇 EVALUACIÓN DE CABELLO (2/2)

📸 Ahora sube foto VISTA LATERAL:
• Perfil (90°)
• Cabello claramente visible
• Peinado completo en cuadro

⚠️ Importante:
• Ángulo lateral
• Buena iluminación
• Foto clara`,
        PT: `💇 AVALIAÇÃO DE CABELO (2/2)

📸 Agora envie foto VISTA LATERAL:
• Perfil (90°)
• Cabelo claramente visível
• Penteado completo no quadro

⚠️ Importante:
• Ângulo lateral
• Boa iluminação
• Foto clara`,
        FR: `💇 ÉVALUATION CHEVEUX (2/2)

📸 Maintenant téléchargez photo VUE DE PROFIL:
• Profil (90°)
• Cheveux clairement visibles
• Coiffure complète dans cadre

⚠️ Important:
• Angle latéral
• Bon éclairage
• Photo claire`
    };
    return texts[lang] || texts.EN;
};

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

export const hairHandler = (bot: Bot<MyContext>) => {

    bot.callbackQuery("rate_hair", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        if (user.coins < HAIR_COST) {
            await ctx.reply(
                ctx.t("not-enough-coins", { balance: user.coins, required: HAIR_COST }),
                { reply_markup: getBackKeyboard(ctx) }
            );
            await ctx.answerCallbackQuery();
            return;
        }

        hairPhotoSessions.set(ctx.from!.id, {});

        await ctx.replyWithPhoto(new InputFile(FRONT_PHOTO_EXAMPLE), {
            caption: getFrontPhotoText((user.language || "EN") as Language),
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.on("message:photo", async (ctx, next) => {
        const user = await findUser(ctx.from!.id);
        if (!user) return next();

        const session = hairPhotoSessions.get(ctx.from!.id);
        if (!session) return next();

        try {
            const photo = ctx.message.photo?.[ctx.message.photo.length - 1];
            if (!photo) return;

            const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN!, photo.file_id);

            if (!photoUrl) {
                await ctx.reply(ctx.t("error-occurred"));
                return;
            }

            if (!session.frontPhotoUrl) {
                const loadingMsg = await ctx.reply(ctx.t("hair-analyzing"));

                const validation = await validatePhoto(photoUrl, "front", (user.language || "EN") as Language);

                await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

                if (!validation.isValid) {
                    const currentFails = user.preCheckFails || 0;

                    if (currentFails < PRECHECK_FREE_ATTEMPTS) {
                        await incrementPreCheckFails(Number(user.id));
                        const remainingFree = PRECHECK_FREE_ATTEMPTS - currentFails - 1;

                        await ctx.reply(
                            ctx.t("hair-validation-failed-free", {
                                error: validation.error || "Invalid photo",
                                remaining: remainingFree
                            }),
                            { reply_markup: getBackKeyboard(ctx) }
                        );
                    } else {
                        await deductCoins(Number(user.id), PRECHECK_PENALTY);
                        await incrementPreCheckFails(Number(user.id));

                        await ctx.reply(
                            ctx.t("hair-validation-failed-paid", {
                                error: validation.error || "Invalid photo",
                                penalty: PRECHECK_PENALTY,
                                balance: user.coins - PRECHECK_PENALTY
                            }),
                            { reply_markup: getBackKeyboard(ctx) }
                        );
                    }
                    return;
                }

                session.frontPhotoUrl = photoUrl;
                hairPhotoSessions.set(ctx.from!.id, session);

                await ctx.replyWithPhoto(new InputFile(SIDE_PHOTO_EXAMPLE), {
                    caption: getSidePhotoText((user.language || "EN") as Language),
                    reply_markup: getBackKeyboard(ctx)
                });
                return;
            }

            if (session.frontPhotoUrl && !session.sidePhotoUrl) {
                const loadingMsg = await ctx.reply(ctx.t("hair-analyzing"));

                const validation = await validatePhoto(photoUrl, "side", (user.language || "EN") as Language);

                if (!validation.isValid) {
                    await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

                    const currentFails = user.preCheckFails || 0;

                    if (currentFails < PRECHECK_FREE_ATTEMPTS) {
                        await incrementPreCheckFails(Number(user.id));
                        const remainingFree = PRECHECK_FREE_ATTEMPTS - currentFails - 1;

                        await ctx.reply(
                            ctx.t("hair-validation-failed-free", {
                                error: validation.error || "Invalid photo",
                                remaining: remainingFree
                            }),
                            { reply_markup: getBackKeyboard(ctx) }
                        );
                    } else {
                        await deductCoins(Number(user.id), PRECHECK_PENALTY);
                        await incrementPreCheckFails(Number(user.id));

                        await ctx.reply(
                            ctx.t("hair-validation-failed-paid", {
                                error: validation.error || "Invalid photo",
                                penalty: PRECHECK_PENALTY,
                                balance: user.coins - PRECHECK_PENALTY
                            }),
                            { reply_markup: getBackKeyboard(ctx) }
                        );
                    }

                    return;
                }

                session.sidePhotoUrl = photoUrl;

                const newBalance = await deductCoins(Number(user.id), HAIR_COST);
                await resetPreCheckFails(Number(user.id));

                const analysisResult = await analyzeHair(session.frontPhotoUrl, (user.language || "EN") as Language);

                hairAnalysisResults.set(user.id, {
                    result: analysisResult,
                    photoUrl: session.frontPhotoUrl,
                    gender: analysisResult.gender || "male",
                    usedButtons: {
                        suggest: false,
                        improve: false,
                        barber: false
                    }
                });

                hairPhotoSessions.delete(ctx.from!.id);

                await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

                const ui = getHairUI((user.language || "EN") as Language);
                const scores = analysisResult.scores;

                let message = `${getRatingEmoji(analysisResult.totalScore)} ${ui.totalScore}: ${analysisResult.totalScore}/100\n\n`;

                message += `${ui.faceShape}:\n${translateFaceShape(analysisResult.faceShape, (user.language || "EN") as Language)}\n\n`;
                const capitalizedStyle = analysisResult.currentStyle.charAt(0).toUpperCase() + analysisResult.currentStyle.slice(1);
                message += `${ui.currentStyle}:\n${capitalizedStyle}\n\n`;

                message += `${ui.details}:\n\n`;
                message += `${ui.health}: ${scores.health}/100\n${getProgressBar(scores.health)}\n\n`;
                message += `${ui.volume}: ${scores.volume}/100\n${getProgressBar(scores.volume)}\n\n`;
                message += `${ui.texture}: ${scores.texture}/100\n${getProgressBar(scores.texture)}\n\n`;
                message += `${ui.color}: ${scores.color}/100\n${getProgressBar(scores.color)}\n\n`;
                message += `${ui.styling}: ${scores.styling}/100\n${getProgressBar(scores.styling)}\n\n`;
                message += `${ui.maintenance}: ${scores.maintenance}/100\n${getProgressBar(scores.maintenance)}\n\n`;

                message += `💎 ${ctx.t("balance")}: ${newBalance ?? 0} ${ctx.t("look-coins")}`;

                const keyboard = new InlineKeyboard()
                    .text(ui.suggestHairstyleButton, "hair_suggest")
                    .row()
                    .text(ui.improveCurrentButton, "hair_improve")
                    .row()
                    .text(ui.backButton, "back_menu");

                await ctx.reply(message, {
                    reply_markup: keyboard
                });

                await logAnalysis(
                    Number(user.telegramId),
                    "style",
                    HAIR_COST,
                    true,
                    { hairScore: analysisResult.totalScore }
                );
            }

        } catch (error) {
            await notifyAdminAboutError(error as Error, 'hair analysis', ctx.from!.id);
            await ctx.reply(ctx.t("error-occurred"), {
                reply_markup: getBackKeyboard(ctx)
            });
        }
    });

    bot.callbackQuery("hair_suggest", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) return;

        const analysis = hairAnalysisResults.get(user.id);
        if (!analysis) {
            await ctx.answerCallbackQuery({ text: ctx.t("no-analysis-yet") });
            return;
        }

        if (analysis.usedButtons.suggest) {
            await ctx.answerCallbackQuery({ text: "⚠️ Уже использовано", show_alert: true });
            return;
        }

        const ui = getHairUI((user.language || "EN") as Language);
        const loadingMsg = await ctx.reply(ui.generatingSuggestion);

        try {
            const suggestion = await suggestHairstyle(analysis.photoUrl, analysis.result, (user.language || "EN") as Language);

            analysis.suggestion = suggestion;
            analysis.usedButtons.suggest = true;
            hairAnalysisResults.set(user.id, analysis);

            await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

            const keyboard = new InlineKeyboard();
            if (!analysis.usedButtons.barber) {
                keyboard.text(ui.barberInstructionsButton, "hair_barber").row();
            }
            keyboard.text(ui.backToHairMenu, "back_menu");

            const cleanSuggestion = suggestion.replace(/\*\*/g, '').replace(/\*/g, '');

            await ctx.reply(`${ui.hairstyleSuggestionTitle}\n\n${cleanSuggestion}`, {
                reply_markup: keyboard
            });

        } catch (error) {
            await notifyAdminAboutError(error as Error, 'hair suggestion generation', ctx.from!.id);
            await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id).catch(() => {});
            await ctx.reply(ctx.t("error-occurred"));
        }

        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("hair_improve", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) return;

        const analysis = hairAnalysisResults.get(user.id);
        if (!analysis) {
            await ctx.answerCallbackQuery({ text: ctx.t("no-analysis-yet") });
            return;
        }

        if (analysis.usedButtons.improve) {
            await ctx.answerCallbackQuery({ text: "⚠️ Уже использовано", show_alert: true });
            return;
        }

        const ui = getHairUI((user.language || "EN") as Language);
        const loadingMsg = await ctx.reply(ui.generatingImprovement);

        try {
            const improvements = await improveCurrentHair(analysis.photoUrl, analysis.result, (user.language || "EN") as Language);

            analysis.usedButtons.improve = true;
            hairAnalysisResults.set(user.id, analysis);

            await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

            const keyboard = new InlineKeyboard()
                .text(ui.backToHairMenu, "back_menu");

            const cleanImprovements = improvements.replace(/\*\*/g, '').replace(/\*/g, '');

            await ctx.reply(`${ui.improvementTitle}\n\n${cleanImprovements}`, {
                reply_markup: keyboard
            });

        } catch (error) {
            await notifyAdminAboutError(error as Error, 'hair improvement tips', ctx.from!.id);
            await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id).catch(() => {});
            await ctx.reply(ctx.t("error-occurred"));
        }

        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("hair_barber", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) return;

        const analysis = hairAnalysisResults.get(user.id);
        if (!analysis || !analysis.suggestion) {
            await ctx.answerCallbackQuery({ text: ctx.t("no-suggestion-yet") });
            return;
        }

        if (analysis.usedButtons.barber) {
            await ctx.answerCallbackQuery({ text: "⚠️ Уже использовано", show_alert: true });
            return;
        }

        const ui = getHairUI((user.language || "EN") as Language);
        const loadingMsg = await ctx.reply(ui.generatingBarberText);

        try {

            const gender = analysis.gender || "male";

            const barberText = await generateBarberInstructions(
                analysis.suggestion,
                (user.language || "EN") as Language,
                gender
            );

            analysis.usedButtons.barber = true;
            hairAnalysisResults.set(user.id, analysis);

            await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);

            const keyboard = new InlineKeyboard()
                .text(ui.backToHairMenu, "back_menu");

            const cleanBarberText = barberText.replace(/\*\*/g, '').replace(/\*/g, '');

            await ctx.reply(`${ui.barberInstructionsTitle}\n\n${cleanBarberText}`, {
                reply_markup: keyboard
            });

        } catch (error) {
            await notifyAdminAboutError(error as Error, 'barber instructions generation', ctx.from!.id);
            await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id).catch(() => {});
            await ctx.reply(ctx.t("error-occurred"));
        }

        await ctx.answerCallbackQuery();
    });
};
