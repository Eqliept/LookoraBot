import type { Bot } from "grammy";
import { InputFile, InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getBackKeyboard, getMainMenuKeyboard } from "../keyboards/index.js";
import { logAnalysis, notifyAdminAboutError } from "../utils/logger.js";
import { findUser, deductCoins, removeCoinsFromUser, incrementPreCheckFails, resetPreCheckFails, PRECHECK_PENALTY, PRECHECK_FREE_ATTEMPTS } from "../services/user.service.js";
import { validatePhoto, getTelegramFileUrl, analyzeBattle } from "../services/gpt.service.js";
import { BATTLE_COST, FRONT_PHOTO_EXAMPLE, SIDE_PHOTO_EXAMPLE } from "../constants/index.js";
import { getBattleUI } from "../translations/battle.translations.js";
import type { Language } from "../types/index.js";
import "dotenv/config";
import * as process from "node:process";

interface BattleSession {
    stage: "player1_front" | "player1_side" | "player2_front" | "player2_side";
    player1FrontUrl?: string;
    player1SideUrl?: string;
    player2FrontUrl?: string;
    player2SideUrl?: string;
}

const battleSessions = new Map<number, BattleSession>();

const getProgressBar = (value: number): string => {
    const filled = Math.round(value / 10);
    const empty = 10 - filled;
    return "▓".repeat(filled) + "░".repeat(empty);
};

const getWinnerEmoji = (diff: number): string => {
    if (diff > 15) return "🏆";
    if (diff > 5) return "✨";
    return "👑";
};

export const battleHandler = (bot: Bot<MyContext>) => {
    bot.callbackQuery("rate_battle", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        if (user.coins < BATTLE_COST) {
            await ctx.reply(
                ctx.t("not-enough-coins", { balance: user.coins, required: BATTLE_COST }),
                { reply_markup: getBackKeyboard(ctx) }
            );
            await ctx.answerCallbackQuery();
            return;
        }

        const ui = getBattleUI((user.language || "EN") as Language);
        
        battleSessions.set(ctx.from!.id, { stage: "player1_front" });

        await ctx.replyWithPhoto(new InputFile(FRONT_PHOTO_EXAMPLE), {
            caption: ui.sendPlayer1Front,
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.on("message:photo", async (ctx, next) => {
        const session = battleSessions.get(ctx.from!.id);
        if (!session) return next();

        const user = await findUser(ctx.from!.id);
        if (!user) return next();

        const ui = getBattleUI((user.language || "EN") as Language);
        
        const photo = ctx.message.photo[ctx.message.photo.length - 1]!;
        const photoUrl = await getTelegramFileUrl(process.env.BOT_TOKEN!, photo.file_id);

        if (!photoUrl) {
            await ctx.reply(ctx.t("photo-invalid", { error: ui.photoLoadError }));
            return;
        }

        const checkingMsg = await ctx.reply(ctx.t("checking-photo"));

        const photoType = session.stage.includes("front") ? "front" : "side";
        const validation = await validatePhoto(photoUrl, photoType, (user.language || "EN") as Language);

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
            
            await ctx.reply(ctx.t("photo-invalid", { error: validation.error || ui.photoInvalid }) + penaltyMessage);
            return;
        }
        
        await resetPreCheckFails(ctx.from!.id);

        // Обработка стадий баттла
        if (session.stage === "player1_front") {
            session.player1FrontUrl = photoUrl;
            session.stage = "player1_side";
            battleSessions.set(ctx.from!.id, session);

            await ctx.replyWithPhoto(new InputFile(SIDE_PHOTO_EXAMPLE), {
                caption: ui.sendPlayer1Side
            });
        } else if (session.stage === "player1_side") {
            session.player1SideUrl = photoUrl;
            session.stage = "player2_front";
            battleSessions.set(ctx.from!.id, session);

            await ctx.replyWithPhoto(new InputFile(FRONT_PHOTO_EXAMPLE), {
                caption: ui.sendPlayer2Front
            });
        } else if (session.stage === "player2_front") {
            session.player2FrontUrl = photoUrl;
            session.stage = "player2_side";
            battleSessions.set(ctx.from!.id, session);

            await ctx.replyWithPhoto(new InputFile(SIDE_PHOTO_EXAMPLE), {
                caption: ui.sendPlayer2Side
            });
        } else if (session.stage === "player2_side") {
            session.player2SideUrl = photoUrl;
            battleSessions.delete(ctx.from!.id);

            // Списываем монеты и получаем обновлённого пользователя
            const updatedUser = await removeCoinsFromUser(ctx.from!.id, BATTLE_COST);
            if (!updatedUser) {
                await ctx.reply(ctx.t("not-enough-coins", { balance: user.coins, required: BATTLE_COST }));
                return;
            }

            const analyzingMsg = await ctx.reply(ui.analyzing);

            try {
                const result = await analyzeBattle(
                    session.player1FrontUrl!,
                    session.player1SideUrl!,
                    session.player2FrontUrl!,
                    photoUrl,
                    (user.language || "EN") as Language
                );
                
                await logAnalysis(ctx.from!.id, 'appearance', BATTLE_COST, true, { type: 'battle' });

                await ctx.api.deleteMessage(ctx.chat!.id, analyzingMsg.message_id);

                const p1 = result.player1;
                const p2 = result.player2;
                
                // Определяем победителя
                const winner = p1.totalScore > p2.totalScore ? 1 : p1.totalScore < p2.totalScore ? 2 : 0;
                const scoreDiff = Math.abs(p1.totalScore - p2.totalScore);
                
                let resultMessage = `⚔️ ${ui.battleTitle}\n\n`;
                
                // Итоговые оценки
                if (winner === 1) {
                    resultMessage += `${getWinnerEmoji(scoreDiff)} ${ui.player1}: ${p1.totalScore}/100 — ${ui.winner}!\n`;
                    resultMessage += `   ${ui.player2}: ${p2.totalScore}/100\n\n`;
                } else if (winner === 2) {
                    resultMessage += `   ${ui.player1}: ${p1.totalScore}/100\n`;
                    resultMessage += `${getWinnerEmoji(scoreDiff)} ${ui.player2}: ${p2.totalScore}/100 — ${ui.winner}!\n\n`;
                } else {
                    resultMessage += `🤝 ${ui.player1}: ${p1.totalScore}/100\n`;
                    resultMessage += `🤝 ${ui.player2}: ${p2.totalScore}/100\n`;
                    resultMessage += `\n🤝 ${ui.draw}!\n\n`;
                }
                
                // Детальное сравнение
                resultMessage += `📊 ${ui.comparison}:\n\n`;
                
                const params = [
                    { key: 'eyes', label: ui.eyes },
                    { key: 'nose', label: ui.nose },
                    { key: 'lips', label: ui.lips },
                    { key: 'skin', label: ui.skin },
                    { key: 'jawline', label: ui.jawline },
                    { key: 'cheekbones', label: ui.cheekbones },
                    { key: 'symmetry', label: ui.symmetry },
                    { key: 'eyebrows', label: ui.eyebrows }
                ];
                
                for (const param of params) {
                    const v1 = p1.scores[param.key as keyof typeof p1.scores];
                    const v2 = p2.scores[param.key as keyof typeof p2.scores];
                    const paramWinner = v1 > v2 ? "👤1" : v2 > v1 ? "👤2" : "🤝";
                    resultMessage += `${param.label}:\n`;
                    resultMessage += `  ${ui.player1}: ${v1} ${v1 > v2 ? "✓" : ""}\n`;
                    resultMessage += `  ${ui.player2}: ${v2} ${v2 > v1 ? "✓" : ""}\n\n`;
                }
                
                // Коэффициенты впечатления
                resultMessage += `🎯 ${ui.impressionCoeff}:\n`;
                resultMessage += `  ${ui.player1}: ×${p1.overallCoefficient.toFixed(2)}\n`;
                resultMessage += `  ${ui.player2}: ×${p2.overallCoefficient.toFixed(2)}\n\n`;
                
                // Вердикт
                if (winner !== 0) {
                    resultMessage += `\n📝 ${ui.verdict}:\n${result.verdict}\n\n`;
                }
                
                resultMessage += `💎 ${ui.charged}: ${BATTLE_COST} coins\n`;
                resultMessage += `💎 ${ui.remaining}: ${updatedUser?.coins ?? 0} coins`;

                const keyboard = new InlineKeyboard()
                    .text(ui.newBattle, "rate_battle")
                    .row()
                    .text(ui.backButton, "back_menu");

                await ctx.reply(resultMessage, { reply_markup: keyboard });
            } catch (error) {
                await notifyAdminAboutError(error as Error, 'battle analysis', ctx.from!.id);
                await ctx.api.deleteMessage(ctx.chat!.id, analyzingMsg.message_id).catch(() => {});
                await ctx.reply(ctx.t("maintenance-mode"));
                return;
            }
        }
    });

    bot.callbackQuery("back_menu", async (ctx, next) => {
        battleSessions.delete(ctx.from!.id);
        await next();
    });
};
