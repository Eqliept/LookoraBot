import { InlineKeyboard } from "grammy";
import { padText } from "./utils.js";
import { APPEARANCE_COST, STYLE_COST } from "../constants/index.js";
const HAIR_COST = 75;
/**
 * Клавиатура выбора услуги (Начать)
 */
export const getServicesKeyboard = (ctx) => {
    return new InlineKeyboard()
        .text(padText(`${ctx.t("rate-appearance")} — ${APPEARANCE_COST} 💎`), "rate_appearance")
        .row()
        .text(padText(`${ctx.t("rate-style")} — ${STYLE_COST} 💎`), "rate_style")
        .row()
        .text(padText(`${ctx.t("rate-hair")} — ${HAIR_COST} 💎`), "rate_hair")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};
//# sourceMappingURL=services.keyboard.js.map