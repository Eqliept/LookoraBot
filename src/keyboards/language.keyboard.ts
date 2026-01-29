import { InlineKeyboard } from "grammy";
import { padText } from "./utils.js";

export const getLanguageKeyboard = (): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText("🇬🇧 English"), "lang_EN")
        .text(padText("🇪🇸 Español"), "lang_ES")
        .row()
        .text(padText("🇧🇷 Português"), "lang_PT")
        .text(padText("🇫🇷 Français"), "lang_FR")
        .row()
        .text(padText("🇷🇺 Русский"), "lang_RU")
        .text(padText("🇺🇦 Українська"), "lang_UA");
};
