import { InputFile } from "grammy";
import { getLanguageKeyboard, getMainMenuKeyboard, getBackKeyboard, getHelpMenuKeyboard, getAgreementKeyboardByLang } from "../keyboards/index.js";
import { userExists, createUser, updateUserLanguage, findUser } from "../services/user.service.js";
import { MAIN_IMAGE, HELP_IMAGE } from "../constants/index.js";
import { getHowToUseText, getAppearanceHelpText, getStyleHelpText, getCoinsHelpText, getAgreementText, getHelpMenuText, getAgreementInfoText, getAgreementAcceptedText } from "../translations/help.translations.js";
// Хранилище для пользователей, ожидающих принятия соглашения
const pendingAgreement = new Map();
// Вспомогательная функция для получения языка
async function getUserLanguage(ctx) {
    const user = await findUser(ctx.from.id);
    return user?.language || "EN";
}
// Функция для приветственного сообщения
export async function getWelcomeMessage(ctx) {
    const user = await findUser(ctx.from.id);
    const locale = user?.language?.toLowerCase() || "en";
    const messages = {
        ru: `🎯 Добро пожаловать в Lookora!

🤖 Я — бот для анализа внешности. Загрузите фото и получите детальную оценку с рекомендациями.

💎 Начните прямо сейчас:
• Оцените свою внешность
• Получите советы по стилю
• Узнайте свои сильные стороны

👇 Выберите действие:`,
        en: `🎯 Welcome to Lookora!

🤖 I'm an appearance analysis bot. Upload your photo and get a detailed rating with personalized recommendations.

💎 Start now:
• Rate your appearance
• Get style tips
• Discover your strengths

👇 Choose an action:`,
        ua: `🎯 Ласкаво просимо до Lookora!

🤖 Я — бот для аналізу зовнішності. Завантажте фото та отримайте детальну оцінку з рекомендаціями.

💎 Почніть прямо зараз:
• Оцініть свою зовнішність
• Отримайте поради щодо стилю
• Дізнайтеся свої сильні сторони

👇 Оберіть дію:`,
        es: `🎯 ¡Bienvenido a Lookora!

🤖 Soy un bot de análisis de apariencia. Sube tu foto y obtén una evaluación detallada con recomendaciones personalizadas.

💎 Comienza ahora:
• Evalúa tu apariencia
• Obtén consejos de estilo
• Descubre tus fortalezas

👇 Elige una acción:`,
        fr: `🎯 Bienvenue sur Lookora!

🤖 Je suis un bot d'analyse d'apparence. Téléchargez votre photo et obtenez une évaluation détaillée avec des recommandations personnalisées.

💎 Commencez maintenant:
• Évaluez votre apparence
• Obtenez des conseils de style
• Découvrez vos points forts

👇 Choisissez une action:`,
        pt: `🎯 Bem-vindo ao Lookora!

🤖 Sou um bot de análise de aparência. Envie sua foto e receba uma avaliação detalhada com recomendações personalizadas.

💎 Comece agora:
• Avalie sua aparência
• Receba dicas de estilo
• Descubra seus pontos fortes

👇 Escolha uma ação:`
    };
    return messages[locale] || messages.en;
}
// Функция для сообщения "с возвращением"
export async function getWelcomeBackMessage(ctx) {
    const user = await findUser(ctx.from.id);
    const locale = user?.language?.toLowerCase() || "en";
    const messages = {
        ru: `✨ С возвращением в Lookora! ✨

🔮 Ваш персональный бот-ассистент по анализу внешности готов к работе.

👇 Выберите действие:`,
        en: `✨ Welcome back to Lookora! ✨

🔮 Your personal appearance assistant bot is ready.

👇 Choose an action:`,
        ua: `✨ З поверненням до Lookora! ✨

🔮 Ваш персональний бот-асистент з аналізу зовнішності готовий до роботи.

👇 Оберіть дію:`,
        es: `✨ ¡Bienvenido de nuevo a Lookora! ✨

🔮 Tu asistente bot personal de apariencia está listo.

👇 Elige una acción:`,
        fr: `✨ Bon retour sur Lookora! ✨

🔮 Votre assistant bot personnel d'apparence est prêt.

👇 Choisissez une action:`,
        pt: `✨ Bem-vindo de volta ao Lookora! ✨

🔮 Seu assistente bot pessoal de aparência está pronto.

👇 Escolha uma ação:`
    };
    return messages[locale] || messages.en;
}
export const startHandler = (bot) => {
    bot.command("start", async (ctx) => {
        const userId = ctx.from.id;
        if (await userExists(userId)) {
            await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                caption: await getWelcomeBackMessage(ctx),
                reply_markup: getMainMenuKeyboard(ctx)
            });
        }
        else {
            await ctx.reply(ctx.t("select-language"), {
                reply_markup: getLanguageKeyboard()
            });
        }
    });
    // Команда /help
    bot.command("help", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.replyWithPhoto(new InputFile(HELP_IMAGE), {
            caption: getHelpMenuText(lang),
            reply_markup: getHelpMenuKeyboard(ctx)
        });
    });
    // Команда /language
    bot.command("language", async (ctx) => {
        await ctx.reply(ctx.t("select-language"), {
            reply_markup: getLanguageKeyboard()
        });
    });
    bot.callbackQuery(/^lang_(EN|ES|PT|FR|RU|UA)$/, async (ctx) => {
        const userId = ctx.from.id;
        const language = ctx.match[1];
        const isNewUser = !(await userExists(userId));
        if (isNewUser) {
            // Для нового пользователя - показываем соглашение
            pendingAgreement.set(userId, language);
            ctx.i18n.useLocale(language.toLowerCase());
            await ctx.editMessageText(getAgreementInfoText(language), {
                reply_markup: getAgreementKeyboardByLang(language)
            });
        }
        else {
            await updateUserLanguage(userId, language);
            ctx.i18n.useLocale(language.toLowerCase());
            await ctx.editMessageText(ctx.t("language-set"));
            await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
                caption: await getWelcomeMessage(ctx),
                reply_markup: getMainMenuKeyboard(ctx)
            });
        }
        await ctx.answerCallbackQuery();
    });
    // Прочитать лицензионное соглашение (при регистрации)
    bot.callbackQuery("read_agreement", async (ctx) => {
        const userId = ctx.from.id;
        const pendingLang = pendingAgreement.get(userId);
        const lang = pendingLang || await getUserLanguage(ctx);
        await ctx.reply(getAgreementText(lang), {
            reply_markup: getAgreementKeyboardByLang(lang)
        });
        await ctx.answerCallbackQuery();
    });
    // Принять лицензионное соглашение
    bot.callbackQuery("accept_agreement", async (ctx) => {
        const userId = ctx.from.id;
        const language = pendingAgreement.get(userId);
        if (!language) {
            // Если пользователь уже зарегистрирован
            if (await userExists(userId)) {
                await ctx.answerCallbackQuery({ text: "✅" });
                return;
            }
            await ctx.answerCallbackQuery({ text: "Please select language first with /start" });
            return;
        }
        // Создаём пользователя
        await createUser(userId, language);
        pendingAgreement.delete(userId);
        ctx.i18n.useLocale(language.toLowerCase());
        await ctx.editMessageText(getAgreementAcceptedText(language));
        await ctx.replyWithPhoto(new InputFile(MAIN_IMAGE), {
            caption: await getWelcomeMessage(ctx),
            reply_markup: getMainMenuKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("change_language", async (ctx) => {
        await ctx.reply(ctx.t("select-language"), {
            reply_markup: getLanguageKeyboard()
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("help", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.replyWithPhoto(new InputFile(HELP_IMAGE), {
            caption: getHelpMenuText(lang),
            reply_markup: getHelpMenuKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    // Разделы помощи
    bot.callbackQuery("help_how_to_use", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.reply(getHowToUseText(lang), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("help_appearance", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.reply(getAppearanceHelpText(lang), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("help_style", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.reply(getStyleHelpText(lang), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("help_coins", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.reply(getCoinsHelpText(lang), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
    bot.callbackQuery("help_agreement", async (ctx) => {
        const lang = await getUserLanguage(ctx);
        await ctx.reply(getAgreementText(lang), {
            reply_markup: getBackKeyboard(ctx)
        });
        await ctx.answerCallbackQuery();
    });
};
//# sourceMappingURL=start.handler.js.map