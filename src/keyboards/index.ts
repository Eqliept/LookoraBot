import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { getPackageInfo } from "../services/wallet.service.ts";
import { ADMIN_ID } from "../constants/index.ts";

const padText = (text: string, width: number = 20): string => {
    const padding = Math.max(0, width - text.length);
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return " ".repeat(left) + text + " ".repeat(right);
};

export const getLanguageKeyboard = (): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText("🇬🇧 English"), "lang_EN")
        .text(padText("🇪🇸 Español"), "lang_ES")
        .row()
        .text(padText("🇧🇷 Português"), "lang_PT")
        .text(padText("🇫🇷 Français"), "lang_FR")
        .row()
        .text(padText("🇷🇺 Русский"), "lang_RU")
        .text(padText("🇺🇦 Українська"), "lang_UA");
};

export const getMainMenuKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("get-started")), "get_started")
        .text(padText(ctx.t("get-coins")), "get_coins")
        .row()
        .text(padText(ctx.t("change-language")), "change_language")
        .text(padText(ctx.t("help")), "help");
};

export const getBackKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("back")), "back_menu");
};

/**
 * Клавиатура выбора услуги (Начать)
 */
export const getServicesKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("rate-appearance")), "rate_appearance")
        .row()
        .text(padText(ctx.t("rate-style")), "rate_style")
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

export const getPaymentMethodKeyboard = (ctx: MyContext, amount: number): InlineKeyboard => {
    const pkg = getPackageInfo(amount);
    const starsPrice = Math.ceil(pkg.price * 50);
    const isAdmin = ctx.from?.id === ADMIN_ID;
    
    const keyboard = new InlineKeyboard()
        .text(padText(`💎 CryptoBot — $${pkg.price}`), `pay_crypto_${amount}`)
        .row()
        .text(padText(`⭐ Telegram Stars — ${starsPrice}⭐`), `pay_stars_${amount}`)
        .row();
    
    if (isAdmin) {
        keyboard.text(padText("🔧 Админ: Выдать монеты"), `pay_admin_${amount}`).row();
    }
    
    keyboard.text(padText(ctx.t("back")), "back_to_packages");
    
    return keyboard;
};

export const getAdminTopUpKeyboard = (ctx: MyContext, amount: number): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText("✅ Подтвердить"), `admin_confirm_${amount}`)
        .row()
        .text(padText(ctx.t("cancel")), "cancel_topup");
};
