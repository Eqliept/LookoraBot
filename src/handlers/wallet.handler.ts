import { Bot, InputFile, InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { getTopUpKeyboard, getMainMenuKeyboard, getPaymentMethodKeyboard, getAdminTopUpKeyboard } from "../keyboards/index.ts";
import { getPackageInfo } from "../services/wallet.service.ts";
import { findUser } from "../services/user.service.ts";
import { createCryptoBotInvoice, checkInvoiceStatus } from "../services/cryptobot.service.ts";
import { ADMIN_ID, WALLET_IMAGE, MAIN_IMAGE } from "../constants/index.ts";

const awaitingCustomAmount = new Set<number>();
const pendingPayments = new Map<number, { amount: number; total: number; invoiceId?: number }>();

// Функция для красивого сообщения о пакете
function getPackageMessage(ctx: MyContext, pkg: { amount: number; bonus: number; total: number; price: number }) {
    const user = findUser(ctx.from!.id);
    const locale = user?.language?.toLowerCase() || "en";
    
    const messages: Record<string, string> = {
        ru: `✨ ВАШ ПАКЕТ ✨

📦 Базовое количество: ${pkg.amount} лук койнов
🎁 Бонус: +${pkg.bonus}%

💎 ИТОГО: ${pkg.total} лук койнов
💳 Цена: $${pkg.price}

✅ Выберите способ оплаты:`,
        
        en: `✨ YOUR PACKAGE ✨

📦 Base amount: ${pkg.amount} look coins
🎁 Bonus: +${pkg.bonus}%

💎 TOTAL: ${pkg.total} look coins
💳 Price: $${pkg.price}

✅ Choose your payment method:`,
        
        es: `✨ TU PAQUETE ✨

📦 Cantidad base: ${pkg.amount} look coins
🎁 Bonus: +${pkg.bonus}%

💎 TOTAL: ${pkg.total} look coins
💳 Precio: $${pkg.price}

✅ Elige tu método de pago:`,
        
        fr: `✨ VOTRE FORFAIT ✨

📦 Quantité de base: ${pkg.amount} look coins
🎁 Bonus: +${pkg.bonus}%

💎 TOTAL: ${pkg.total} look coins
💳 Prix: $${pkg.price}

✅ Choisissez votre mode de paiement:`,
        
        pt: `✨ SEU PACOTE ✨

📦 Quantidade base: ${pkg.amount} look coins
🎁 Bônus: +${pkg.bonus}%

💎 TOTAL: ${pkg.total} look coins
💳 Preço: $${pkg.price}

✅ Escolha seu método de pagamento:`,
        
        ua: `✨ ВАШ ПАКЕТ ✨

📦 Базова кількість: ${pkg.amount} лук койнів
🎁 Бонус: +${pkg.bonus}%

💎 ВСЬОГО: ${pkg.total} лук койнів
💳 Ціна: $${pkg.price}

✅ Оберіть спосіб оплати:`
    };
    
    return messages[locale] || messages["en"];
}

export const walletHandler = (bot: Bot<MyContext>) => {
    // Команда /wallet
    bot.command("wallet", async (ctx) => {
        const user = findUser(ctx.from!.id);
        if (!user) {
            await ctx.reply(ctx.t("not-registered"));
            return;
        }

        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user.coins }),
            reply_markup: getTopUpKeyboard(ctx)
        });
    });

    // Кнопка "Получить монеты" в меню
    bot.callbackQuery("get_coins", async (ctx) => {
        const user = findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user.coins }),
            reply_markup: getTopUpKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Выбор пакета
    bot.callbackQuery(/^topup_(500|1000|3000)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1]);
        const pkg = getPackageInfo(amount);

        await ctx.reply(getPackageMessage(ctx, pkg), {
            reply_markup: getPaymentMethodKeyboard(ctx, amount)
        });
        await ctx.answerCallbackQuery();
    });

    // Свое количество
    bot.callbackQuery("topup_custom", async (ctx) => {
        awaitingCustomAmount.add(ctx.from!.id);
        await ctx.reply(ctx.t("topup-enter-amount"));
        await ctx.answerCallbackQuery();
    });

    // Обработка текстового ввода суммы
    bot.on("message:text", async (ctx, next) => {
        if (!awaitingCustomAmount.has(ctx.from!.id)) {
            return next();
        }

        const amount = parseInt(ctx.message.text);
        
        if (isNaN(amount) || amount < 100 || amount > 100000) {
            await ctx.reply(ctx.t("topup-invalid-amount"));
            return;
        }

        awaitingCustomAmount.delete(ctx.from!.id);
        const pkg = getPackageInfo(amount);

        await ctx.reply(getPackageMessage(ctx, pkg), {
            reply_markup: getPaymentMethodKeyboard(ctx, amount)
        });
    });

    // ===== ОПЛАТА ЧЕРЕЗ CRYPTOBOT =====
    bot.callbackQuery(/^pay_crypto_(\d+)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1]);
        const pkg = getPackageInfo(amount);
        const userId = ctx.from!.id;

        await ctx.answerCallbackQuery({ text: ctx.t("creating-invoice") });

        const invoice = await createCryptoBotInvoice({
            amount: pkg.price,
            asset: "USDT",
            description: `${pkg.total} монет для Lookora Bot`,
            payload: JSON.stringify({ userId, amount, total: pkg.total })
        });

        if (invoice) {
            pendingPayments.set(userId, { amount, total: pkg.total, invoiceId: invoice.invoice_id });

            await ctx.reply(
                ctx.t("pay-crypto-info", { total: pkg.total, price: pkg.price, bonus: pkg.bonus }),
                {
                    reply_markup: new InlineKeyboard()
                        .url(ctx.t("pay-button"), invoice.bot_invoice_url)
                        .row()
                        .text(ctx.t("check-payment"), `check_crypto_${invoice.invoice_id}`)
                        .row()
                        .text(ctx.t("cancel"), "cancel_topup")
                }
            );
        } else {
            await ctx.reply(ctx.t("payment-error"));
        }
    });

    // Проверка оплаты CryptoBot
    bot.callbackQuery(/^check_crypto_(\d+)$/, async (ctx) => {
        const invoiceId = parseInt(ctx.match[1]);
        const userId = ctx.from!.id;
        const pending = pendingPayments.get(userId);

        if (!pending) {
            await ctx.answerCallbackQuery({ text: ctx.t("payment-expired") });
            return;
        }

        const status = await checkInvoiceStatus(invoiceId);

        if (status === "paid") {
            const user = findUser(userId);
            if (user) {
                user.coins += pending.total;
            }
            pendingPayments.delete(userId);

            await ctx.reply(
                ctx.t("topup-success", { total: pending.total, balance: user?.coins ?? 0 })
            );
            await ctx.answerCallbackQuery({ text: ctx.t("payment-success") });
        } else if (status === "expired") {
            pendingPayments.delete(userId);
            await ctx.answerCallbackQuery({ text: ctx.t("payment-expired") });
            await ctx.reply(ctx.t("payment-expired-msg"), {
                reply_markup: getTopUpKeyboard(ctx)
            });
        } else {
            await ctx.answerCallbackQuery({ text: ctx.t("payment-pending"), show_alert: true });
        }
    });

    // ===== ОПЛАТА ЧЕРЕЗ TELEGRAM STARS =====
    bot.callbackQuery(/^pay_stars_(\d+)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1]);
        const pkg = getPackageInfo(amount);
        const starsPrice = Math.ceil(pkg.price * 50); // 1$ ≈ 50 звёзд

        // Отправляем инструкцию
        await ctx.reply(
            ctx.t("pay-stars-info", { total: pkg.total, stars: starsPrice, bonus: pkg.bonus })
        );

        await ctx.answerCallbackQuery();

        // Создаём инвойс для Telegram Stars
        await ctx.api.raw.sendInvoice({
            chat_id: ctx.chat!.id,
            title: `${pkg.total} монет`,
            description: `Пополнение баланса на ${pkg.total} монет`,
            payload: JSON.stringify({ userId: ctx.from!.id, amount, total: pkg.total }),
            currency: "XTR", // Telegram Stars
            prices: [{ label: `${pkg.total} монет`, amount: starsPrice }]
        });
    });

    // Обработка успешной оплаты Stars
    bot.on("pre_checkout_query", async (ctx) => {
        await ctx.answerPreCheckoutQuery(true);
    });

    bot.on("message:successful_payment", async (ctx) => {
        const payment = ctx.message.successful_payment;
        const payload = JSON.parse(payment.invoice_payload);
        
        const user = findUser(payload.userId);
        if (user) {
            user.coins += payload.total;
            await ctx.reply(
                ctx.t("topup-success", { total: payload.total, balance: user.coins })
            );
        }
    });

    // ===== АДМИН: Выдача монет =====
    bot.callbackQuery(/^pay_admin_(\d+)$/, async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.answerCallbackQuery({ text: "⛔ Только для админа!" });
            return;
        }

        const amount = parseInt(ctx.match[1]);
        const pkg = getPackageInfo(amount);
        
        await ctx.reply(
            ctx.t("admin-topup-confirm", { amount: pkg.amount, total: pkg.total }),
            {
                reply_markup: getAdminTopUpKeyboard(ctx, amount)
            }
        );
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/^admin_confirm_(\d+)$/, async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.answerCallbackQuery({ text: "⛔ Только для админа!" });
            return;
        }

        const amount = parseInt(ctx.match[1]);
        const pkg = getPackageInfo(amount);
        const user = findUser(ctx.from!.id);

        if (user) {
            user.coins += pkg.total;
            await ctx.reply(
                ctx.t("topup-success", { total: pkg.total, balance: user.coins })
            );
        }
        await ctx.answerCallbackQuery({ text: "✅ Монеты начислены!" });
    });

    // Отмена
    bot.callbackQuery("cancel_topup", async (ctx) => {
        const user = findUser(ctx.from!.id);
        pendingPayments.delete(ctx.from!.id);
        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user?.coins ?? 0 }),
            reply_markup: getTopUpKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Назад к выбору пакета
    bot.callbackQuery("back_to_packages", async (ctx) => {
        const user = findUser(ctx.from!.id);
        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user?.coins ?? 0 }),
            reply_markup: getTopUpKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    // Назад в меню
    bot.callbackQuery("back_menu", async (ctx) => {
        await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
            caption: ctx.t("welcome"),
            reply_markup: getMainMenuKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
};
