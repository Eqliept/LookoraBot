import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { padText } from "./utils.ts";

export const getMainMenuKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("get-started")), "get_started")
        .text(padText(ctx.t("get-coins")), "get_coins")
        .row()
        .text(padText(ctx.t("change-language")), "change_language")
        .text(padText(ctx.t("help")), "help");
};
