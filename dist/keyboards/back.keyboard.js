import { InlineKeyboard } from "grammy";
import { padText } from "./utils.js";
export const getBackKeyboard = (ctx) => {
    return new InlineKeyboard()
        .text(padText(ctx.t("back")), "back_menu");
};
//# sourceMappingURL=back.keyboard.js.map