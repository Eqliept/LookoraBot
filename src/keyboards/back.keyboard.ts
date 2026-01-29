import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.ts";
import { padText } from "./utils.ts";

export const getBackKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("back")), "back_menu");
};
