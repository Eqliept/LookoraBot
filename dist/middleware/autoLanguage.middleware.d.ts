import { Context } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";
export type MyContext = Context & I18nFlavor;
export declare const autoLanguageMiddleware: (ctx: MyContext, next: () => Promise<void>) => Promise<void>;
/**
 * Middleware для проверки авторизации пользователя
 * Пропускает только /start, выбор языка и соглашение для неавторизованных
 */
export declare const authMiddleware: (ctx: MyContext, next: () => Promise<void>) => Promise<void>;
//# sourceMappingURL=autoLanguage.middleware.d.ts.map