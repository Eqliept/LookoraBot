import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import { padText } from "./utils.js";
import type { Language } from "../types/index.js";

// Переводы кнопок для незарегистрированных пользователей
const agreementButtonTexts: Record<Language, { accept: string; read: string }> = {
    RU: { accept: "✅ Принять и продолжить", read: "📜 Прочитать соглашение" },
    EN: { accept: "✅ Accept and continue", read: "📜 Read agreement" },
    UA: { accept: "✅ Прийняти і продовжити", read: "📜 Прочитати угоду" },
    ES: { accept: "✅ Aceptar y continuar", read: "📜 Leer acuerdo" },
    FR: { accept: "✅ Accepter et continuer", read: "📜 Lire l'accord" },
    PT: { accept: "✅ Aceitar e continuar", read: "📜 Ler acordo" }
};

/**
 * Клавиатура принятия лицензионного соглашения (для авторизованных)
 */
export const getAgreementKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("accept-agreement")), "accept_agreement")
        .row()
        .text(padText(ctx.t("read-agreement")), "read_agreement");
};

/**
 * Клавиатура принятия лицензионного соглашения (для регистрации - без ctx.t)
 */
export const getAgreementKeyboardByLang = (lang: Language): InlineKeyboard => {
    const texts = agreementButtonTexts[lang] || agreementButtonTexts.EN!;
    return new InlineKeyboard()
        .text(padText(texts.accept), "accept_agreement")
        .row()
        .text(padText(texts.read), "read_agreement");
};

/**
 * Клавиатура разделов помощи
 */
export const getHelpMenuKeyboard = (ctx: MyContext): InlineKeyboard => {
    return new InlineKeyboard()
        .text(padText(ctx.t("help-how-to-use")), "help_how_to_use")
        .row()
        .text(padText(ctx.t("help-appearance-info")), "help_appearance")
        .row()
        .text(padText(ctx.t("help-style-info")), "help_style")
        .row()
        .text(padText(ctx.t("help-hair-info")), "help_hair")
        .row()
        .text(padText(ctx.t("help-coins-info")), "help_coins")
        .row()
        .text(padText(ctx.t("help-agreement")), "help_agreement")
        .row()
        .text(padText(ctx.t("back")), "back_menu");
};
