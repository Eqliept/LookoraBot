import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { padText } from "./utils.js";

/**
 * Клавиатура выбора категории стиля
 */
export const getStyleCategoryKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("style-casual")), "style_cat_casual")
        .text(padText(ctx.t("style-work")), "style_cat_work")
        .row()
        .text(padText(ctx.t("style-date")), "style_cat_date")
        .text(padText(ctx.t("style-social")), "style_cat_social")
        .row()
        .text(padText(ctx.t("style-event")), "style_cat_event")
        .text(padText(ctx.t("style-custom")), "style_cat_custom")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};
