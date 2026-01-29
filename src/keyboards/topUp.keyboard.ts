import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { getPackageInfo } from "../services/wallet.service.ts";
import { padText } from "./utils.ts";

// Клавиатура выбора: купить себе или подарить
export const getBuyForKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("buy-for-self")), "buy_for_self")
        .row()
        .text(padText(ctx.t("buy-for-friend")), "buy_for_friend")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};

export const getTopUpKeyboard = (ctx: MyContext): InlineKeyboard => {
    const pkg500 = getPackageInfo(500);
    const pkg1000 = getPackageInfo(1000);
    const pkg3000 = getPackageInfo(3000);

    return new InlineKeyboard()
        .text(padText(`💰 500 (+${pkg500.bonus}%) = ${pkg500.total} — $${pkg500.price}`), "topup_500")
        .row()
        .text(padText(`💎 1000 (+${pkg1000.bonus}%) = ${pkg1000.total} — $${pkg1000.price}`), "topup_1000")
        .row()
        .text(padText(`👑 3000 (+${pkg3000.bonus}%) = ${pkg3000.total} — $${pkg3000.price}`), "topup_3000")
        .row()
        .text(padText(ctx.t("topup-custom")), "topup_custom")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};

// Клавиатура выбора пакета для подарка
export const getGiftPackageKeyboard = (ctx: MyContext): InlineKeyboard => {
    const pkg500 = getPackageInfo(500);
    const pkg1000 = getPackageInfo(1000);
    const pkg3000 = getPackageInfo(3000);

    return new InlineKeyboard()
        .text(padText(`🎁 500 (+${pkg500.bonus}%) = ${pkg500.total} — $${pkg500.price}`), "gift_500")
        .row()
        .text(padText(`🎁 1000 (+${pkg1000.bonus}%) = ${pkg1000.total} — $${pkg1000.price}`), "gift_1000")
        .row()
        .text(padText(`🎁 3000 (+${pkg3000.bonus}%) = ${pkg3000.total} — $${pkg3000.price}`), "gift_3000")
        .row()
        .text(padText(ctx.t("cancel")), "cancel_gift");
};

// Клавиатура выбора метода оплаты для подарка
export const getGiftPaymentKeyboard = (ctx: MyContext, amount: number): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText("💳 CryptoBot (USDT)"), `gift_pay_crypto_${amount}`)
        .row()
        .text(padText("⭐ Telegram Stars"), `gift_pay_stars_${amount}`)
        .row()
        .text(padText(ctx.t("cancel")), "cancel_gift");
};
