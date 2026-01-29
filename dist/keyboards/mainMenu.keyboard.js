import { InlineKeyboard } from "grammy";
import { padText } from "./utils.js";
export const getMainMenuKeyboard = (ctx) => {
    return new InlineKeyboard()
        .text(padText(ctx.t("get-started")), "get_started")
        .text(padText(ctx.t("get-coins")), "get_coins")
        .row()
        .text(padText(ctx.t("change-language")), "change_language")
        .text(padText(ctx.t("help")), "help");
};
//# sourceMappingURL=mainMenu.keyboard.js.map