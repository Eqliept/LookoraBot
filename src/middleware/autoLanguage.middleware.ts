import { Context } from "grammy";
import { findUser } from "../services/user.service.ts";
import type { I18nFlavor } from "@grammyjs/i18n";

export type MyContext = Context & I18nFlavor;

export const autoLanguageMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    if (ctx.from) {
        const user = findUser(ctx.from.id);
        if (user) {
            ctx.i18n.useLocale(user.language.toLowerCase());
        }
    }
    await next();
};