import { I18n } from "@grammyjs/i18n";
import { autoLanguageMiddleware, authMiddleware } from "./middleware/autoLanguage.middleware.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const en = require("./languages/en.json");
const es = require("./languages/es.json");
const fr = require("./languages/fr.json");
const pt = require("./languages/pt.json");
const ru = require("./languages/ru.json");
const ua = require("./languages/ua.json");
function jsonToFluent(obj) {
    return Object.entries(obj)
        .map(([key, value]) => {
        // В JSON после парсинга \n уже становится реальным переносом строки
        // Для Fluent нужно добавить отступ для многострочных значений
        const lines = value.split('\n');
        if (lines.length === 1) {
            return `${key} = ${value}`;
        }
        // Многострочное значение: первая строка после =, остальные с отступом
        const formattedValue = lines.join('\n    ');
        return `${key} = ${formattedValue}`;
    })
        .join("\n");
}
export function createMiddlewares(bot) {
    const i18n = new I18n({
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
//# sourceMappingURL=createMiddlewares.js.map