import type { Bot } from "grammy";
import type { LanguageCode } from "grammy/types";
import type { MyContext } from "./middleware/autoLanguage.middleware.js";
import type { Language } from "./types/index.js";

// Команды бота для разных языков
const commandTranslations: Record<Language, { start: string; wallet: string; help: string; language: string }> = {
    RU: {
        start: "Запустить бота",
        wallet: "Мой баланс",
        help: "Помощь",
        language: "Сменить язык"
    },
    EN: {
        start: "Start the bot",
        wallet: "My balance",
        help: "Help",
        language: "Change language"
    },
    ES: {
        start: "Iniciar el bot",
        wallet: "Mi saldo",
        help: "Ayuda",
        language: "Cambiar idioma"
    },
    FR: {
        start: "Démarrer le bot",
        wallet: "Mon solde",
        help: "Aide",
        language: "Changer de langue"
    },
    PT: {
        start: "Iniciar o bot",
        wallet: "Meu saldo",
        help: "Ajuda",
        language: "Mudar idioma"
    },
    UA: {
        start: "Запустити бота",
        wallet: "Мій баланс",
        help: "Допомога",
        language: "Змінити мову"
    }
};

// Маппинг Language на language_code Telegram
const langToCode: Record<Language, LanguageCode> = {
    RU: "ru",
    EN: "en",
    ES: "es",
    FR: "fr",
    PT: "pt",
    UA: "uk"
};

/**
 * Настройка команд бота (меню)
 */
export async function setupBotCommands(bot: Bot<MyContext>) {
    // Устанавливаем команды для каждого языка
    for (const [lang, translations] of Object.entries(commandTranslations)) {
        const languageCode = langToCode[lang as Language];
        
        await bot.api.setMyCommands(
            [
                { command: "start", description: translations.start },
                { command: "wallet", description: translations.wallet },
                { command: "help", description: translations.help },
                { command: "language", description: translations.language }
            ],
            { language_code: languageCode! }
        );
    }

    // Устанавливаем команды по умолчанию (английский)
    await bot.api.setMyCommands([
        { command: "start", description: commandTranslations.EN!.start },
        { command: "wallet", description: commandTranslations.EN!.wallet },
        { command: "help", description: commandTranslations.EN!.help },
        { command: "language", description: commandTranslations.EN!.language }
    ]);

    console.log("✅ Bot commands menu set up successfully");
}
