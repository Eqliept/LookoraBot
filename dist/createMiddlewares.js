import { I18n } from "@grammyjs/i18n";
import { autoLanguageMiddleware, authMiddleware } from "./middleware/autoLanguage.middleware.js";
import en from "./languages/en.json" ;
import es from "./languages/es.json" ;
import fr from "./languages/fr.json" ;
import pt from "./languages/pt.json" ;
import ru from "./languages/ru.json" ;
import ua from "./languages/ua.json" ;
function jsonToFluent(obj) {
    return Object.entries(obj)
        .map(([key, value]) => {
        // Заменяем \n на реальные переносы с отступом для Fluent
        const formattedValue = value.replace(/\\n/g, "\n    ");
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