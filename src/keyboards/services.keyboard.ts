import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { padText } from "./utils.ts";
import { APPEARANCE_COST, STYLE_COST } from "../constants/index.ts";

/**
 * Клавиатура выбора услуги (Начать)
 */
export const getServicesKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(`${ctx.t("rate-appearance")} — ${APPEARANCE_COST} 💎`), "rate_appearance")
        .row()
        .text(padText(`${ctx.t("rate-style")} — ${STYLE_COST} 💎`), "rate_style")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};
