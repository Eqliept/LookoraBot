import { InlineKeyboard } from "grammy";
import { getPackageInfo } from "../services/wallet.service.js";
import { ADMIN_ID } from "../constants/index.js";
import { padText } from "./utils.js";
export const getPaymentMethodKeyboard = (ctx, amount) => {
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
//# sourceMappingURL=payment.keyboard.js.map