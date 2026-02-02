import { findUser } from "../services/user.service.js";
import { getSubscriptionKeyboardByLang } from "../keyboards/index.js";
import { t } from "../utils/i18n.js";
export const autoLanguageMiddleware = async (ctx, next) => {
    if (ctx.from) {
        const user = await findUser(ctx.from.id);
        if (user?.language) {
            ctx.i18n.useLocale(user.language.toLowerCase());
        }
    }
    await next();
};
/**
 * Middleware для проверки авторизации пользователя
 * Пропускает только /start, выбор языка, соглашение и подписку для неавторизованных
 */
export const authMiddleware = async (ctx, next) => {
    // Пропускаем команду /start
    if (ctx.message?.text?.startsWith("/start")) {
        return next();
    }
    // Пропускаем callback выбора языка
    if (ctx.callbackQuery?.data?.startsWith("lang_")) {
        return next();
    }
    // Пропускаем callback'и лицензионного соглашения (нужны до регистрации)
    if (ctx.callbackQuery?.data === "read_agreement" || ctx.callbackQuery?.data === "accept_agreement") {
        return next();
    }
    // Пропускаем callback проверки подписки при регистрации
    if (ctx.callbackQuery?.data === "check_registration_subscription") {
        return next();
    }
    // Проверяем авторизацию
    if (ctx.from) {
        const user = await findUser(ctx.from.id);
        if (user) {
            // Пользователь существует - проверяем подписку на канал
            if (!user.channelBonusClaimed) {
                // Не завершил регистрацию - показываем экран подписки
                const lang = user.language || "EN";
                if (ctx.callbackQuery) {
                    await ctx.answerCallbackQuery({
                        text: "⚠️ Сначала подпишитесь на канал!",
                        show_alert: true
                    });
                }
                await ctx.reply(t('subscription-required', lang), {
                    reply_markup: getSubscriptionKeyboardByLang(lang),
                    parse_mode: "Markdown"
                });
                return;
            }
            return next();
        }
    }
    // Пользователь не авторизован
    if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({
            text: "❌ Please register first with /start",
            show_alert: true
        });
    }
    else if (ctx.message) {
        await ctx.reply(`❌ Please register first with /start command.

🌍 Для начала работы выполните команду /start`);
    }
};
//# sourceMappingURL=autoLanguage.middleware.js.map