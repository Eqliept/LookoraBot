import { InlineKeyboard } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
import type { Language } from "../types/index.js";
/**
 * Клавиатура обязательной подписки на канал (для регистрации - без ctx.t)
 */
export declare const getSubscriptionKeyboardByLang: (lang: Language) => InlineKeyboard;
/**
 * Клавиатура принятия лицензионного соглашения (для авторизованных)
 */
export declare const getAgreementKeyboard: (ctx: MyContext) => InlineKeyboard;
/**
 * Клавиатура принятия лицензионного соглашения (для регистрации - без ctx.t)
 */
export declare const getAgreementKeyboardByLang: (lang: Language) => InlineKeyboard;
/**
 * Клавиатура разделов помощи
 */
export declare const getHelpMenuKeyboard: (ctx: MyContext) => InlineKeyboard;
//# sourceMappingURL=help.keyboard.d.ts.map