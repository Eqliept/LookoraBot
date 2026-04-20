import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { padText } from "./utils.js";
import { APPEARANCE_COST, STYLE_COST, BATTLE_COST } from "../constants/index.js";

const HAIR_COST = 75;

export const getServicesKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(`${ctx.t("rate-appearance")} — ${APPEARANCE_COST} 💎`), "rate_appearance")
        .row()
        .text(padText(`${ctx.t("rate-style")} — ${STYLE_COST} 💎`), "rate_style")
        .row()
        .text(padText(`${ctx.t("rate-hair")} — ${HAIR_COST} 💎`), "rate_hair")
        .row()
        .text(padText(`${ctx.t("rate-battle")} — ${BATTLE_COST} 💎`), "rate_battle")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};
