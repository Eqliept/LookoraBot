import { InlineKeyboard } from "grammy";
import { CHANNEL_ID, CHANNEL_URL, CHANNEL_BONUS } from "../constants/index.js";
import { findUser, claimChannelBonus } from "../services/user.service.js";
import { logCoinsOperation } from "../utils/logger.js";
import { t } from "../utils/i18n.js";
export const channelHandler = (bot) => {
    // Показать информацию о бонусе за подписку
    bot.callbackQuery("channel_bonus", async (ctx) => {
        await ctx.answerCallbackQuery();
        const user = await findUser(ctx.from.id);
        if (!user) {
            await ctx.reply(ctx.t("not-registered"));
            return;
        }
        // Проверяем, не получил ли пользователь уже бонус
        if (user.channelBonusClaimed) {
            await ctx.reply(ctx.t("bonus-already-claimed"));
            return;
        }
        // Показываем информацию о бонусе
        const keyboard = new InlineKeyboard()
            .url(ctx.t("subscribe-channel"), CHANNEL_URL)
            .row()
            .text(ctx.t("check-subscription"), "check_channel_subscription")
            .row()
            .text(ctx.t("back"), "back_menu");
        await ctx.reply(ctx.t("channel-bonus-info"), {
            reply_markup: keyboard,
            parse_mode: "Markdown"
        });
    });
    // Проверить подписку на канал
    bot.callbackQuery("check_channel_subscription", async (ctx) => {
        await ctx.answerCallbackQuery();
        const user = await findUser(ctx.from.id);
        if (!user) {
            await ctx.reply(ctx.t("not-registered"));
            return;
        }
        // Проверяем, не получил ли пользователь уже бонус
        if (user.channelBonusClaimed) {
            await ctx.reply(ctx.t("bonus-already-claimed"));
            return;
        }
        try {
            // Проверяем подписку на канал
            const member = await ctx.api.getChatMember(CHANNEL_ID, ctx.from.id);
            // Проверяем статус участника канала
            const isSubscribed = ["member", "administrator", "creator"].includes(member.status);
            if (!isSubscribed) {
                await ctx.reply(ctx.t("not-subscribed"), { parse_mode: "Markdown" });
                return;
            }
            // Начисляем бонус
            const updatedUser = await claimChannelBonus(ctx.from.id, CHANNEL_BONUS);
            if (updatedUser) {
                logCoinsOperation(ctx.from.id, 'add', CHANNEL_BONUS, 'Channel subscription bonus', { channelId: CHANNEL_ID });
                await ctx.reply(t('bonus-claimed', user.language, { balance: updatedUser.coins }));
            }
            else {
                await ctx.reply(ctx.t("bonus-already-claimed"));
            }
        }
        catch (error) {
            await ctx.reply("❌ Не удалось проверить подписку. Убедитесь, что бот добавлен в канал как администратор.");
        }
    });
    // Кнопка "Назад в меню"
    bot.callbackQuery("back_menu", async (ctx) => {
        await ctx.answerCallbackQuery();
        // Возврат в главное меню обрабатывается в start.handler.ts
    });
};
//# sourceMappingURL=channel.handler.js.map