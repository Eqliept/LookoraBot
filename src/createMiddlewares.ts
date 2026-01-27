import type { Bot } from "grammy";
import { I18n } from "@grammyjs/i18n";
import { autoLanguageMiddleware, authMiddleware, type MyContext } from "./middleware/autoLanguage.middleware.ts";

import en from "./languages/en.json" with { type: "json" };
import es from "./languages/es.json" with { type: "json" };
import fr from "./languages/fr.json" with { type: "json" };
import pt from "./languages/pt.json" with { type: "json" };
import ru from "./languages/ru.json" with { type: "json" };
import ua from "./languages/ua.json" with { type: "json" };

function jsonToFluent(obj: Record<string, string>): string {
    return Object.entries(obj)
        .map(([key, value]) => {
            // Заменяем \n на реальные переносы с отступом для Fluent
            const formattedValue = value.replace(/\\n/g, "\n    ");
            return `${key} = ${formattedValue}`;
        })
        .join("\n");
}

export function createMiddlewares(bot: Bot<MyContext>) {
    const i18n = new I18n<MyContext>({
        defaultLocale: "en",
    });

    i18n.loadLocale("en", { source: jsonToFluent(en) });
    i18n.loadLocale("es", { source: jsonToFluent(es) });
    i18n.loadLocale("fr", { source: jsonToFluent(fr) });
    i18n.loadLocale("pt", { source: jsonToFluent(pt) });
    i18n.loadLocale("ru", { source: jsonToFluent(ru) });
    i18n.loadLocale("ua", { source: jsonToFluent(ua) });

    bot.use(i18n);
    bot.use(autoLanguageMiddleware);
    bot.use(authMiddleware);
}