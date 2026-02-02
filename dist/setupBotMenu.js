import { ADMIN_ID } from "./constants/index.js";
// Команды бота для разных языков
const commandTranslations = {
    RU: {
        start: "🚀 Запустить бота",
        wallet: "💰 Мой баланс",
        help: "❓ Помощь",
        language: "🌍 Сменить язык"
    },
    EN: {
        start: "🚀 Start the bot",
        wallet: "💰 My balance",
        help: "❓ Help",
        language: "🌍 Change language"
    },
    ES: {
        start: "🚀 Iniciar el bot",
        wallet: "💰 Mi saldo",
        help: "❓ Ayuda",
        language: "🌍 Cambiar idioma"
    },
    FR: {
        start: "🚀 Démarrer le bot",
        wallet: "💰 Mon solde",
        help: "❓ Aide",
        language: "🌍 Changer de langue"
    },
    PT: {
        start: "🚀 Iniciar o bot",
        wallet: "💰 Meu saldo",
        help: "❓ Ajuda",
        language: "🌍 Mudar idioma"
    },
    UA: {
        start: "🚀 Запустити бота",
        wallet: "💰 Мій баланс",
        help: "❓ Допомога",
        language: "🌍 Змінити мову"
    }
};
// Маппинг Language на language_code Telegram
const langToCode = {
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
export async function setupBotCommands(bot) {
    // Устанавливаем команды для каждого языка
    for (const [lang, translations] of Object.entries(commandTranslations)) {
        const languageCode = langToCode[lang];
        await bot.api.setMyCommands([
            { command: "start", description: translations.start },
            { command: "wallet", description: translations.wallet },
            { command: "help", description: translations.help },
            { command: "language", description: translations.language }
        ], { language_code: languageCode });
    }
    // Устанавливаем команды по умолчанию (английский)
    await bot.api.setMyCommands([
        { command: "start", description: commandTranslations.EN.start },
        { command: "wallet", description: commandTranslations.EN.wallet },
        { command: "help", description: commandTranslations.EN.help },
        { command: "language", description: commandTranslations.EN.language }
    ]);
    // Устанавливаем расширенное меню для админа
    await bot.api.setMyCommands([
        { command: "start", description: "🚀 Start the bot" },
        { command: "wallet", description: "💰 My balance" },
        { command: "help", description: "❓ Help" },
        { command: "language", description: "🌍 Change language" },
        { command: "admin", description: "⚙️ Admin panel" },
        { command: "give", description: "💎 Give coins" },
        { command: "take", description: "🔻 Take coins" },
        { command: "stats", description: "📊 User statistics" },
        { command: "rich", description: "🏆 Top 10 richest" },
        { command: "user", description: "👤 User info" },
        { command: "purchases", description: "🛒 Recent purchases" }
    ], {
        scope: { type: "chat", chat_id: ADMIN_ID }
    });
    console.log("✅ Bot commands menu set up successfully");
}
//# sourceMappingURL=setupBotMenu.js.map