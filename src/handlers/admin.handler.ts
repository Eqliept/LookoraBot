import { Bot } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { ADMIN_ID } from "../constants/index.js";
import { findUser, addCoinsToUser, removeCoinsFromUser } from "../services/user.service.js";
import { logger, logUserAction } from "../utils/logger.js";

const awaitingGiveCoins = new Map<number, { step: "user_id" | "amount"; targetUserId?: number }>();
const awaitingTakeCoins = new Map<number, { step: "user_id" | "amount"; targetUserId?: number }>();

export const adminHandler = (bot: Bot<MyContext>) => {
    // 💰 Выдать монеты пользователю
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

    // 🔻 Забрать монеты у пользователя
    bot.command("take", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const args = ctx.message?.text?.split(" ").slice(1) || [];
        
        if (args.length === 2) {
            const targetId = parseInt(args[0]!);
            const amount = parseInt(args[1]!);
            
            if (isNaN(targetId) || isNaN(amount) || amount <= 0) {
                await ctx.reply("❌ Неверный формат. Используйте: /take <telegram_id> <количество>");
                return;
            }
            
            await takeCoins(ctx, targetId, amount);
        } else {
            awaitingTakeCoins.set(ctx.from!.id, { step: "user_id" });
            await ctx.reply("👤 Введите Telegram ID пользователя, у которого хотите забрать монеты:");
        }
    });

    // 📊 Общая статистика
    bot.command("stats", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const { prisma } = await import("../services/database.service.js");
        
        const totalUsers = await prisma.user.count();
        const totalCoins = await prisma.user.aggregate({
            _sum: { coins: true }
        });
        const totalPurchases = await prisma.purchase.count();
        
        const usersWithCoins = await prisma.user.findMany({
            where: { coins: { gt: 0 } }
        });
        
        const avgCoins = usersWithCoins.length > 0 
            ? Math.round((totalCoins._sum.coins ?? 0) / usersWithCoins.length)
            : 0;

        const message = `📊 **СТАТИСТИКА БОТА**

👥 **Пользователи:**
• Всего: ${totalUsers}
• С балансом: ${usersWithCoins.length}

💰 **Монеты:**
• Всего в обороте: ${totalCoins._sum.coins ?? 0}
• Средний баланс: ${avgCoins}

🛒 **Покупки:**
• Всего транзакций: ${totalPurchases}`;

        await ctx.reply(message, { parse_mode: "Markdown" });
    });

    // 👥 Список всех пользователей
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

        let message = `👥 **ПОЛЬЗОВАТЕЛИ БОТА**

📈 Всего: ${totalUsers}
💰 Монет в обороте: ${totalCoins._sum.coins ?? 0}`;

        await ctx.reply(message, { parse_mode: "Markdown" });
    });

    // 🏆 Топ самых богатых пользователей
    bot.command("rich", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const { prisma } = await import("../services/database.service.js");
        
        const richestUsers = await prisma.user.findMany({
            orderBy: { coins: "desc" },
            take: 20,
            where: { coins: { gt: 0 } }
        });

        if (richestUsers.length === 0) {
            await ctx.reply("📭 Нет пользователей с балансом.");
            return;
        }

        let message = `🏆 **ТОП-${richestUsers.length} БОГАТЫХ**\n\n`;

        richestUsers.forEach((user, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "💎";
            message += `${medal} ${index + 1}. ID: \`${user.telegramId}\` — **${user.coins}** 💰\n`;
        });

        await ctx.reply(message, { parse_mode: "Markdown" });
    });

    // 🔍 Информация о пользователе
    bot.command("user", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const args = ctx.message?.text?.split(" ").slice(1) || [];
        
        if (args.length !== 1) {
            await ctx.reply("❌ Используйте: /user <telegram_id>");
            return;
        }

        const targetId = parseInt(args[0]!);
        if (isNaN(targetId)) {
            await ctx.reply("❌ Неверный ID пользователя.");
            return;
        }

        const user = await findUser(targetId);
        
        if (!user) {
            await ctx.reply(`❌ Пользователь с ID ${targetId} не найден.`);
            return;
        }

        const { prisma } = await import("../services/database.service.js");
        const purchases = await prisma.purchase.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        let message = `🔍 **ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ**

👤 **ID:** \`${user.telegramId}\`
🌍 **Язык:** ${user.language || "не установлен"}
💰 **Баланс:** ${user.coins} монет
⚠️ **PreCheck fails:** ${user.preCheckFails}
📅 **Регистрация:** ${user.createdAt.toLocaleDateString('ru')}

📦 **Последние покупки:** ${purchases.length}`;

        if (purchases.length > 0) {
            message += "\n\n";
            purchases.forEach((p, i) => {
                message += `${i + 1}. ${p.coins} монет - ${p.createdAt.toLocaleDateString('ru')}\n`;
            });
        }

        await ctx.reply(message, { parse_mode: "Markdown" });
    });

    // 📜 История покупок
    bot.command("purchases", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const { prisma } = await import("../services/database.service.js");
        
        const recentPurchases = await prisma.purchase.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { user: true }
        });

        if (recentPurchases.length === 0) {
            await ctx.reply("📭 Нет покупок.");
            return;
        }

        let message = `📜 **ПОСЛЕДНИЕ 10 ПОКУПОК**\n\n`;

        recentPurchases.forEach((p, i) => {
            const date = p.createdAt.toLocaleDateString('ru');
            const time = p.createdAt.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
            message += `${i + 1}. ID: \`${p.user.telegramId}\`\n`;
            message += `   💰 ${p.coins} монет | 💵 $${p.amountUsd}\n`;
            message += `   📅 ${date} ${time}\n\n`;
        });

        await ctx.reply(message, { parse_mode: "Markdown" });
    });

    // 🔧 Команды админа
    bot.command("admin", async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.reply("⛔ Эта команда доступна только администратору.");
            return;
        }

        const message = `🔧 **КОМАНДЫ АДМИНИСТРАТОРА**

**💰 Управление монетами:**
/give <id> <сумма> - Выдать монеты
/take <id> <сумма> - Забрать монеты

**📊 Статистика:**
/stats - Общая статистика
/users - Список пользователей
/rich - Топ богатых
/purchases - История покупок

**🔍 Информация:**
/user <id> - Информация о пользователе

**🔧 Утилиты:**
/admin - Эта справка`;

        await ctx.reply(message, { parse_mode: "Markdown" });
    });

    // Обработка ввода для /give
    bot.on("message:text", async (ctx, next) => {
        const giveState = awaitingGiveCoins.get(ctx.from!.id);
        if (giveState) {
            if (giveState.step === "user_id") {
                const targetId = parseInt(ctx.message.text);
                
                if (isNaN(targetId)) {
                    await ctx.reply("❌ Неверный ID. Введите числовой Telegram ID:");
                    return;
                }

                giveState.targetUserId = targetId;
                giveState.step = "amount";
                awaitingGiveCoins.set(ctx.from!.id, giveState);
                
                await ctx.reply(`✅ ID: ${targetId}\n\n💰 Теперь введите количество монет для выдачи:`);
                return;
            } else if (giveState.step === "amount" && giveState.targetUserId) {
                const amount = parseInt(ctx.message.text);
                
                if (isNaN(amount) || amount <= 0) {
                    await ctx.reply("❌ Неверное количество. Введите положительное число:");
                    return;
                }

                awaitingGiveCoins.delete(ctx.from!.id);
                await giveCoins(ctx, giveState.targetUserId, amount);
                return;
            }
        }

        // Обработка ввода для /take
        const takeState = awaitingTakeCoins.get(ctx.from!.id);
        if (takeState) {
            if (takeState.step === "user_id") {
                const targetId = parseInt(ctx.message.text);
                
                if (isNaN(targetId)) {
                    await ctx.reply("❌ Неверный ID. Введите числовой Telegram ID:");
                    return;
                }

                takeState.targetUserId = targetId;
                takeState.step = "amount";
                awaitingTakeCoins.set(ctx.from!.id, takeState);
                
                await ctx.reply(`✅ ID: ${targetId}\n\n💸 Теперь введите количество монет для списания:`);
                return;
            } else if (takeState.step === "amount" && takeState.targetUserId) {
                const amount = parseInt(ctx.message.text);
                
                if (isNaN(amount) || amount <= 0) {
                    await ctx.reply("❌ Неверное количество. Введите положительное число:");
                    return;
                }

                awaitingTakeCoins.delete(ctx.from!.id);
                await takeCoins(ctx, takeState.targetUserId, amount);
                return;
            }
        }

        return next();
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
        logUserAction(targetTelegramId, 'admin_give_coins', { amount, admin: ctx.from!.id });
        
        await ctx.reply(`✅ **МОНЕТЫ ВЫДАНЫ**

👤 Пользователь: \`${targetTelegramId}\`
💰 Выдано: +${amount} монет
💎 Новый баланс: **${updatedUser.coins}** монет`, { parse_mode: "Markdown" });

        // Уведомляем пользователя
        if (targetTelegramId !== ctx.from!.id) {
            try {
                await ctx.api.sendMessage(
                    targetTelegramId,
                    `🎁 Вам начислено ${amount} лук койнов!\n\n💎 Ваш баланс: ${updatedUser.coins} монет`
                );
            } catch (error) {
                logger.warn(`Failed to notify user ${targetTelegramId} about coins`);
            }
        }
    } else {
        await ctx.reply("❌ Ошибка при выдаче монет. Попробуйте позже.");
    }
}

async function takeCoins(ctx: MyContext, targetTelegramId: number, amount: number) {
    const targetUser = await findUser(targetTelegramId);
    
    if (!targetUser) {
        await ctx.reply(`❌ Пользователь с ID ${targetTelegramId} не найден в базе данных.`);
        return;
    }

    if (targetUser.coins < amount) {
        await ctx.reply(`⚠️ У пользователя недостаточно монет!\n\n💰 Текущий баланс: ${targetUser.coins}\n💸 Попытка списать: ${amount}`);
        return;
    }

    const updatedUser = await removeCoinsFromUser(targetTelegramId, amount);
    
    if (updatedUser) {
        logUserAction(targetTelegramId, 'admin_take_coins', { amount, admin: ctx.from!.id });
        
        await ctx.reply(`✅ **МОНЕТЫ СПИСАНЫ**

👤 Пользователь: \`${targetTelegramId}\`
💸 Списано: -${amount} монет
💎 Новый баланс: **${updatedUser.coins}** монет`, { parse_mode: "Markdown" });

        // Уведомляем пользователя
        try {
            await ctx.api.sendMessage(
                targetTelegramId,
                `⚠️ С вашего баланса списано ${amount} лук койнов.\n\n💎 Ваш баланс: ${updatedUser.coins} монет`
            );
        } catch (error) {
            logger.warn(`Failed to notify user ${targetTelegramId} about coin deduction`);
        }
    } else {
        await ctx.reply("❌ Ошибка при списании монет. Попробуйте позже.");
    }
}

// Функция для уведомления админа о покупке (экспортируем для использования в wallet handler)
export async function notifyAdminAboutPurchase(
    bot: Bot<MyContext>,
    userId: number,
    amount: number,
    price: number,
    method: string
) {
    try {
        const user = await findUser(userId);
        const username = user ? `ID: ${user.telegramId}` : `ID: ${userId}`;
        
        const message = `🔔 **НОВАЯ ПОКУПКА!**

👤 **Пользователь:** \`${username}\`
💰 **Монеты:** ${amount}
💵 **Сумма:** $${price}
💳 **Способ:** ${method}
📅 **Дата:** ${new Date().toLocaleString('ru')}`;

        await bot.api.sendMessage(ADMIN_ID, message, { parse_mode: "Markdown" });
        
        logger.info('Admin notified about purchase', { userId, amount, price, method });
    } catch (error) {
        logger.error('Failed to notify admin about purchase');
    }
}
