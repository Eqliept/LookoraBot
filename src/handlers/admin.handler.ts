import { Bot } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { ADMIN_ID } from "../constants/index.js";
import { findUser, addCoinsToUser } from "../services/user.service.js";

const awaitingGiveCoins = new Map<number, { step: "user_id" | "amount"; targetUserId?: number }>();

export const adminHandler = (bot: Bot<MyContext>) => {
    bot.command("give", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const args = ctx.message?.text?.split(" ").slice(1) || [];
        
        if (args.length === 2) {
            const targetId = parseInt(args[0]!);
            const amount = parseInt(args[1]!);
            
            if (isNaN(targetId) || isNaN(amount) || amount <= 0) {
                await ctx.reply("❌ Неверный формат. Используйте: /give <telegram_id> <количество>");
                return;
            }
            
            await giveCoins(ctx, targetId, amount);
        } else {
            awaitingGiveCoins.set(ctx.from!.id, { step: "user_id" });
            await ctx.reply("👤 Введите Telegram ID пользователя, которому хотите выдать монеты:");
        }
    });

    bot.command("users", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const { prisma } = await import("../services/database.service.js");
        
        const totalUsers = await prisma.user.count();
        const totalCoins = await prisma.user.aggregate({
            _sum: { coins: true }
        });
        const richestUsers = await prisma.user.findMany({
            orderBy: { coins: "desc" },
            take: 5
        });

        let message = `📊 Статистика пользователей

👥 Всего пользователей: ${totalUsers}
💰 Всего монет в обороте: ${totalCoins._sum.coins ?? 0}

🏆 Топ-5 по балансу:`;

        richestUsers.forEach((user: { telegramId: string; coins: number }, index: number) => {
            message += `\n${index + 1}. ID: ${user.telegramId} — ${user.coins} монет`;
        });

        await ctx.reply(message);
    });

    bot.on("message:text", async (ctx, next) => {
        const state = awaitingGiveCoins.get(ctx.from!.id);
        if (!state) return next();

        if (state.step === "user_id") {
            const targetId = parseInt(ctx.message.text);
            
            if (isNaN(targetId)) {
                await ctx.reply("❌ Неверный ID. Введите числовой Telegram ID:");
                return;
            }

            state.targetUserId = targetId;
            state.step = "amount";
            awaitingGiveCoins.set(ctx.from!.id, state);
            
            await ctx.reply(`✅ ID: ${targetId}\n\n💰 Теперь введите количество монет для выдачи:`);
        } else if (state.step === "amount" && state.targetUserId) {
            const amount = parseInt(ctx.message.text);
            
            if (isNaN(amount) || amount <= 0) {
                await ctx.reply("❌ Неверное количество. Введите положительное число:");
                return;
            }

            awaitingGiveCoins.delete(ctx.from!.id);
            await giveCoins(ctx, state.targetUserId, amount);
        }
    });
};

async function giveCoins(ctx: MyContext, targetTelegramId: number, amount: number) {
    const targetUser = await findUser(targetTelegramId);
    
    if (!targetUser) {
        await ctx.reply(`❌ Пользователь с ID ${targetTelegramId} не найден в базе данных.\n\nПользователь должен сначала запустить бота командой /start`);
        return;
    }

    const updatedUser = await addCoinsToUser(targetTelegramId, amount);
    
    if (updatedUser) {
        await ctx.reply(`✅ Успешно выдано!

👤 Пользователь: ${targetTelegramId}
💰 Выдано: +${amount} монет
💎 Новый баланс: ${updatedUser.coins} монет`);

        if (targetTelegramId !== ctx.from!.id) {
            try {
                await ctx.api.sendMessage(
                    targetTelegramId,
                    `🎁 Вам начислено ${amount} лук койнов!\n\n💎 Ваш баланс: ${updatedUser.coins} монет`
                );
            } catch {
            }
        }
    } else {
        await ctx.reply("❌ Ошибка при выдаче монет. Попробуйте позже.");
    }
}
