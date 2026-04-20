import { Bot, InputFile, InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { getTopUpKeyboard, getMainMenuKeyboard, getPaymentMethodKeyboard, getAdminTopUpKeyboard, getBuyForKeyboard, getGiftPackageKeyboard, getGiftPaymentKeyboard } from "../keyboards/index.js";
import { getPackageInfo } from "../services/wallet.service.js";
import { findUser, addCoinsToUser } from "../services/user.service.js";
import { createCryptoBotInvoice, checkInvoiceStatus } from "../services/cryptobot.service.js";
import { ADMIN_ID, WALLET_IMAGE, MAIN_IMAGE } from "../constants/index.js";
import { getWelcomeBackMessage } from "./start.handler.js";
import { notifyAdminAboutPurchase } from "./admin.handler.js";
import { logPurchase } from "../utils/logger.js";
import type { Language } from "../types/index.js";

const awaitingCustomAmount = new Set<number>();
const pendingPayments = new Map<number, { amount: number; total: number; invoiceId?: number }>();

interface GiftState {
    recipientId?: number;
    amount?: number;
    total?: number;
    message?: string | undefined;
    awaitingId?: boolean;
    awaitingMessage?: boolean;
}
const giftStates = new Map<number, GiftState>();

function getGiftNotification(lang: Language, coins: number, message?: string): string {
    const notifications: Record<Language, { withMsg: string; noMsg: string }> = {
        RU: {
            noMsg: `🎉 ВАМ ПОДАРОК!\n\nВы получили ${coins} лук койнов в подарок!`,
            withMsg: `🎉 ВАМ ПОДАРОК!\n\nВы получили ${coins} лук койнов в подарок!\n\n💬 Сообщение от дарителя:\n${message}`
        },
        EN: {
            noMsg: `🎉 YOU GOT A GIFT!\n\nYou received ${coins} look coins as a gift!`,
            withMsg: `🎉 YOU GOT A GIFT!\n\nYou received ${coins} look coins as a gift!\n\n💬 Message from the sender:\n${message}`
        },
        UA: {
            noMsg: `🎉 ВАМ ПОДАРУНОК!\n\nВи отримали ${coins} лук койнів в подарунок!`,
            withMsg: `🎉 ВАМ ПОДАРУНОК!\n\nВи отримали ${coins} лук койнів в подарунок!\n\n💬 Повідомлення від дарувальника:\n${message}`
        },
        ES: {
            noMsg: `🎉 ¡TIENES UN REGALO!\n\n¡Recibiste ${coins} look coins como regalo!`,
            withMsg: `🎉 ¡TIENES UN REGALO!\n\n¡Recibiste ${coins} look coins como regalo!\n\n💬 Mensaje del remitente:\n${message}`
        },
        FR: {
            noMsg: `🎉 VOUS AVEZ UN CADEAU!\n\nVous avez reçu ${coins} look coins en cadeau!`,
            withMsg: `🎉 VOUS AVEZ UN CADEAU!\n\nVous avez reçu ${coins} look coins en cadeau!\n\n💬 Message de l'expéditeur:\n${message}`
        },
        PT: {
            noMsg: `🎉 VOCÊ GANHOU UM PRESENTE!\n\nVocê recebeu ${coins} look coins de presente!`,
            withMsg: `🎉 VOCÊ GANHOU UM PRESENTE!\n\nVocê recebeu ${coins} look coins de presente!\n\n💬 Mensagem do remetente:\n${message}`
        }
    };

    const texts = notifications[lang] || notifications.EN;
    return message && message !== "-" ? texts!.withMsg : texts!.noMsg;
}

async function getPackageMessage(ctx: MyContext, pkg: { amount: number; bonus: number; total: number; price: number }): Promise<string> {
    const user = await findUser(ctx.from!.id);
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

    return messages[locale] || messages["en"]!;
}

export const walletHandler = (bot: Bot<MyContext>) => {

    bot.command("wallet", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.reply(ctx.t("not-registered"));
            return;
        }

        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user.coins }),
            reply_markup: getTopUpKeyboard(ctx)
        });
    });

    bot.callbackQuery("get_coins", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        if (!user) {
            await ctx.answerCallbackQuery({ text: ctx.t("not-registered") });
            return;
        }

        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user.coins }),
            reply_markup: getBuyForKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("buy_for_self", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        await ctx.reply(ctx.t("wallet-info", { coins: user?.coins ?? 0 }), {
            reply_markup: getTopUpKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("buy_for_friend", async (ctx) => {
        giftStates.set(ctx.from!.id, { awaitingId: true });
        await ctx.reply(ctx.t("gift-enter-id"));
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/^topup_(500|1000|3000)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1]!);
        const pkg = getPackageInfo(amount);

        await ctx.reply(await getPackageMessage(ctx, pkg), {
            reply_markup: getPaymentMethodKeyboard(ctx, amount)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("topup_custom", async (ctx) => {
        awaitingCustomAmount.add(ctx.from!.id);
        await ctx.reply(ctx.t("topup-enter-amount"));
        await ctx.answerCallbackQuery();
    });

    bot.on("message:text", async (ctx, next) => {
        const userId = ctx.from!.id;
        const giftState = giftStates.get(userId);

        if (giftState?.awaitingId) {
            let recipientId: number | undefined;

            const forwardOrigin = ctx.message?.forward_origin;
            if (forwardOrigin?.type === "user") {
                recipientId = forwardOrigin.sender_user.id;
            }

            // @ts-ignore
            const forwardFrom = ctx.message?.forward_from;
            if (!recipientId && forwardFrom?.id) {
                recipientId = forwardFrom.id;
            }

            if (!recipientId) {
                const parsed = parseInt(ctx.message.text);
                if (!isNaN(parsed)) {
                    recipientId = parsed;
                }
            }

            if (!recipientId) {
                await ctx.reply(ctx.t("gift-invalid-id"));
                return;
            }

            const recipient = await findUser(recipientId);
            if (!recipient) {
                await ctx.reply(ctx.t("gift-user-not-found") + `\n\n(ID: ${recipientId})`);
                return;
            }

            giftStates.set(userId, { recipientId, awaitingId: false });
            await ctx.reply(ctx.t("gift-select-package", { recipientId }), {
                reply_markup: getGiftPackageKeyboard(ctx)
            });
            return;
        }

        if (giftState?.awaitingMessage && giftState.recipientId && giftState.total && giftState.amount) {
            const message = ctx.message.text;
            const recipient = await findUser(giftState.recipientId);

            if (!recipient) {
                await ctx.reply(ctx.t("gift-user-not-found"));
                giftStates.delete(userId);
                return;
            }

            const newMessage = message !== "-" ? message : undefined;
            giftStates.set(userId, {
                ...giftState,
                message: newMessage,
                awaitingMessage: false
            });

            if (userId === ADMIN_ID) {
                await addCoinsToUser(giftState.recipientId, giftState.total);

                const notification = getGiftNotification(
                    recipient.language as Language,
                    giftState.total,
                    message !== "-" ? message : undefined
                );

                try {
                    await ctx.api.sendMessage(giftState.recipientId, notification);
                } catch (e) {
                }

                await ctx.reply(ctx.t("gift-sent-success", {
                    coins: giftState.total,
                    recipientId: giftState.recipientId
                }));

                giftStates.delete(userId);
                return;
            }

            const pkg = getPackageInfo(giftState.amount);
            await ctx.reply(
                ctx.t("gift-payment-info", {
                    total: pkg.total,
                    price: pkg.price,
                    recipientId: giftState.recipientId
                }),
                {
                    reply_markup: getGiftPaymentKeyboard(ctx, giftState.amount)
                }
            );
            return;
        }

        if (!awaitingCustomAmount.has(userId)) {
            return next();
        }

        const amount = parseInt(ctx.message.text);

        if (isNaN(amount) || amount < 100 || amount > 100000) {
            await ctx.reply(ctx.t("topup-invalid-amount"));
            return;
        }

        awaitingCustomAmount.delete(userId);
        const pkg = getPackageInfo(amount);

        await ctx.reply(await getPackageMessage(ctx, pkg), {
            reply_markup: getPaymentMethodKeyboard(ctx, amount)
        });
    });

    bot.callbackQuery(/^gift_(500|1000|3000)$/, async (ctx) => {
        const userId = ctx.from!.id;
        const giftState = giftStates.get(userId);

        if (!giftState?.recipientId) {
            await ctx.answerCallbackQuery({ text: "Error: recipient not found" });
            return;
        }

        const amount = parseInt(ctx.match[1]!);
        const pkg = getPackageInfo(amount);

        giftStates.set(userId, {
            ...giftState,
            amount,
            total: pkg.total,
            awaitingMessage: true
        });

        await ctx.reply(ctx.t("gift-enter-message"));
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("cancel_gift", async (ctx) => {
        giftStates.delete(ctx.from!.id);
        await ctx.reply(ctx.t("cancel-gift"));
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery(/^gift_pay_crypto_(\d+)$/, async (ctx) => {
        const userId = ctx.from!.id;
        const giftState = giftStates.get(userId);

        if (!giftState?.recipientId || !giftState.total) {
            await ctx.answerCallbackQuery({ text: "Error: gift data not found" });
            return;
        }

        const amount = parseInt(ctx.match[1]!);
        const pkg = getPackageInfo(amount);

        await ctx.answerCallbackQuery({ text: ctx.t("creating-invoice") });

        const invoice = await createCryptoBotInvoice({
            amount: pkg.price,
            asset: "USDT",
            description: `🎁 Подарок ${pkg.total} монет для друга`,
            payload: JSON.stringify({
                userId,
                amount,
                total: pkg.total,
                isGift: true,
                recipientId: giftState.recipientId,
                giftMessage: giftState.message
            })
        });

        if (invoice) {
            pendingPayments.set(userId, { amount, total: pkg.total, invoiceId: invoice.invoice_id });

            await ctx.reply(
                ctx.t("gift-pay-crypto-info", {
                    total: pkg.total,
                    price: pkg.price,
                    recipientId: giftState.recipientId
                }),
                {
                    reply_markup: new InlineKeyboard()
                        .url(ctx.t("pay-button"), invoice.bot_invoice_url)
                        .row()
                        .text(ctx.t("check-payment"), `check_gift_crypto_${invoice.invoice_id}`)
                        .row()
                        .text(ctx.t("cancel"), "cancel_gift")
                }
            );
        } else {
            await ctx.reply(ctx.t("payment-error"));
        }
    });

    bot.callbackQuery(/^check_gift_crypto_(\d+)$/, async (ctx) => {
        const invoiceId = parseInt(ctx.match[1]!);
        const userId = ctx.from!.id;
        const pending = pendingPayments.get(userId);
        const giftState = giftStates.get(userId);

        if (!pending || !giftState?.recipientId) {
            await ctx.answerCallbackQuery({ text: ctx.t("payment-expired") });
            return;
        }

        const status = await checkInvoiceStatus(invoiceId);

        if (status === "paid") {
            await addCoinsToUser(giftState.recipientId, pending.total);

            const recipient = await findUser(giftState.recipientId);
            if (recipient) {
                const notification = getGiftNotification(
                    recipient.language as Language,
                    pending.total,
                    giftState.message
                );
                try {
                    await ctx.api.sendMessage(giftState.recipientId, notification);
                } catch (e) {
                }
            }

            pendingPayments.delete(userId);
            giftStates.delete(userId);

            await ctx.reply(ctx.t("gift-sent-success", {
                coins: pending.total,
                recipientId: giftState.recipientId
            }));
            await ctx.answerCallbackQuery({ text: ctx.t("payment-success") });
        } else if (status === "expired") {
            pendingPayments.delete(userId);
            giftStates.delete(userId);
            await ctx.answerCallbackQuery({ text: ctx.t("payment-expired") });
            await ctx.reply(ctx.t("payment-expired-msg"));
        } else {
            await ctx.answerCallbackQuery({ text: ctx.t("payment-pending"), show_alert: true });
        }
    });

    bot.callbackQuery(/^gift_pay_stars_(\d+)$/, async (ctx) => {
        const userId = ctx.from!.id;
        const giftState = giftStates.get(userId);

        if (!giftState?.recipientId || !giftState.total) {
            await ctx.answerCallbackQuery({ text: "Error: gift data not found" });
            return;
        }

        const amount = parseInt(ctx.match[1]!);
        const pkg = getPackageInfo(amount);
        const starsPrice = Math.ceil(pkg.price * 50);

        await ctx.reply(
            ctx.t("gift-pay-stars-info", {
                total: pkg.total,
                stars: starsPrice,
                recipientId: giftState.recipientId
            })
        );

        await ctx.answerCallbackQuery();

        await ctx.api.raw.sendInvoice({
            chat_id: ctx.chat!.id,
            title: `🎁 Подарок ${pkg.total} монет`,
            description: `Подарок ${pkg.total} монет для друга`,
            payload: JSON.stringify({
                userId,
                amount,
                total: pkg.total,
                isGift: true,
                recipientId: giftState.recipientId,
                giftMessage: giftState.message
            }),
            currency: "XTR",
            prices: [{ label: `🎁 ${pkg.total} монет`, amount: starsPrice }]
        });
    });

    bot.callbackQuery(/^pay_crypto_(\d+)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1]!);
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

    bot.callbackQuery(/^check_crypto_(\d+)$/, async (ctx) => {
        const invoiceId = parseInt(ctx.match[1]!);
        const userId = ctx.from!.id;
        const pending = pendingPayments.get(userId);

        if (!pending) {
            await ctx.answerCallbackQuery({ text: ctx.t("payment-expired") });
            return;
        }

        const status = await checkInvoiceStatus(invoiceId);

        if (status === "paid") {
            const user = await addCoinsToUser(userId, pending.total);
            pendingPayments.delete(userId);

            logPurchase(
                userId,
                pending.total,
                (pending.amount / 100),
                "CryptoBot"
            );

            await notifyAdminAboutPurchase(
                ctx.api as any,
                userId,
                pending.total,
                (pending.amount / 100),
                "CryptoBot"
            );

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

    bot.callbackQuery(/^pay_stars_(\d+)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1]!);
        const pkg = getPackageInfo(amount);
        const starsPrice = Math.ceil(pkg.price * 50);

        await ctx.reply(
            ctx.t("pay-stars-info", { total: pkg.total, stars: starsPrice, bonus: pkg.bonus })
        );

        await ctx.answerCallbackQuery();

        await ctx.api.raw.sendInvoice({
            chat_id: ctx.chat!.id,
            title: `${pkg.total} монет`,
            description: `Пополнение баланса на ${pkg.total} монет`,
            payload: JSON.stringify({ userId: ctx.from!.id, amount, total: pkg.total }),
            currency: "XTR",
            prices: [{ label: `${pkg.total} монет`, amount: starsPrice }]
        });
    });

    bot.on("pre_checkout_query", async (ctx) => {
        await ctx.answerPreCheckoutQuery(true);
    });

    bot.on("message:successful_payment", async (ctx) => {
        const payment = ctx.message.successful_payment;
        const payload = JSON.parse(payment.invoice_payload);

        if (payload.isGift && payload.recipientId) {
            await addCoinsToUser(payload.recipientId, payload.total);

            const recipient = await findUser(payload.recipientId);
            if (recipient) {
                const notification = getGiftNotification(
                    recipient.language as Language,
                    payload.total,
                    payload.giftMessage
                );
                try {
                    await ctx.api.sendMessage(payload.recipientId, notification);
                } catch (e) {
                }
            }

            giftStates.delete(payload.userId);

            await ctx.reply(ctx.t("gift-sent-success", {
                coins: payload.total,
                recipientId: payload.recipientId
            }));
        } else {
            const user = await addCoinsToUser(payload.userId, payload.total);
            if (user) {

                logPurchase(
                    payload.userId,
                    payload.total,
                    payload.amount / 100,
                    "Telegram Stars"
                );

                await notifyAdminAboutPurchase(
                    ctx.api as any,
                    payload.userId,
                    payload.total,
                    payload.price,
                    "Telegram Stars"
                );

                await ctx.reply(
                    ctx.t("topup-success", { total: payload.total, balance: user.coins })
                );
            }
        }
    });

    bot.callbackQuery(/^pay_admin_(\d+)$/, async (ctx) => {
        if (ctx.from!.id !== ADMIN_ID) {
            await ctx.answerCallbackQuery({ text: "⛔ Только для админа!" });
            return;
        }

        const amount = parseInt(ctx.match[1]!);
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

        const amount = parseInt(ctx.match[1]!);
        const pkg = getPackageInfo(amount);
        const user = await addCoinsToUser(ctx.from!.id, pkg.total);

        if (user) {
            await ctx.reply(
                ctx.t("topup-success", { total: pkg.total, balance: user.coins })
            );
        }
        await ctx.answerCallbackQuery({ text: "✅ Монеты начислены!" });
    });

    bot.callbackQuery("cancel_topup", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        pendingPayments.delete(ctx.from!.id);
        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user?.coins ?? 0 }),
            reply_markup: getTopUpKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("back_to_packages", async (ctx) => {
        const user = await findUser(ctx.from!.id);
        await ctx.replyWithPhoto(new InputFile(WALLET_IMAGE), {
            caption: ctx.t("wallet-info", { coins: user?.coins ?? 0 }),
            reply_markup: getTopUpKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery("back_menu", async (ctx) => {
        await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
            caption: await getWelcomeBackMessage(ctx),
            reply_markup: getMainMenuKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
};
