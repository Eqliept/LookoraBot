import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { getPackageInfo } from "../services/wallet.service.ts";
import { ADMIN_ID } from "../constants/index.ts";
import { padText } from "./utils.ts";

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
