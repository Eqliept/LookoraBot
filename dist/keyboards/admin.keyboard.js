import { InlineKeyboard } from "grammy";
import { padText } from "./utils.js";
export const getAdminTopUpKeyboard = (ctx, amount) => {
    return new InlineKeyboard()
        .text(padText("✅ Подтвердить"), `admin_confirm_${amount}`)
        .row()
        .text(padText(ctx.t("cancel")), "cancel_topup");
};
//# sourceMappingURL=admin.keyboard.js.map