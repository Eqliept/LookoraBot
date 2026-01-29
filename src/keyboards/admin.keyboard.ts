import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { padText } from "./utils.js";

export const getAdminTopUpKeyboard = (ctx: MyContext, amount: number): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText("✅ Подтвердить"), `admin_confirm_${amount}`)
        .row()
        .text(padText(ctx.t("cancel")), "cancel_topup");
};
