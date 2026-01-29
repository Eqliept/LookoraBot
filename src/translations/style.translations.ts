import type { Language, StyleCategory } from "../types/index.ts";

export interface StyleUITranslations {
    selectCategory: string;
    casualTitle: string;
    casualDesc: string;
    workTitle: string;
    workDesc: string;
    dateTitle: string;
    dateDesc: string;
    socialTitle: string;
    socialDesc: string;
    eventTitle: string;
    eventDesc: string;
    customTitle: string;
    customDesc: string;
    enterCustomDesc: string;
    invalidCustomDesc: string;
    sendFullBodyPhoto: string;
    analyzingStyle: string;
    styleResultTitle: string;
    totalScore: string;
    contextCoefficient: string;
    perfectMatch: string;
    goodMatch: string;
    normalMatch: string;
    weakMatch: string;
    poorMatch: string;
    colorHarmony: string;
    fit: string;
    styleConsistency: string;
    accessories: string;
    seasonality: string;
    contextMatch: string;
    strengths: string;
    improvements: string;
    recommendations: string;
    charged: string;
    remaining: string;
    backToMenu: string;
}

export const styleUITranslations: Record<Language, StyleUITranslations> = {
    RU: {
        selectCategory: "👔 Выберите для чего стиль:",
        casualTitle: "👕 Повседневный стиль",
        casualDesc: "Для повседневной жизни: прогулки, встречи с друзьями, шоппинг.",
        workTitle: "💼 Работа / учёба",
        workDesc: "Для офиса, учёбы, деловых ситуаций.",
        dateTitle: "❤️ Свидание",
        dateDesc: "Для романтического контекста.",
        socialTitle: "📱 Соцсети / публичный образ",
        socialDesc: "Для фото, видео, контента, личного бренда.",
        eventTitle: "🎉 Мероприятие",
        eventDesc: "Вечеринки, события, выходы \"в люди\".",
        customTitle: "✏️ Свой вариант",
        customDesc: "Опишите свой контекст кратко.",
        enterCustomDesc: "✏️ Введите краткое описание контекста (4-30 символов):",
        invalidCustomDesc: "❌ Описание должно быть от 4 до 30 символов. Попробуйте снова:",
        sendFullBodyPhoto: "📸 Отправьте фото в ПОЛНЫЙ РОСТ\n\nТребования:\n• Хорошее освещение\n• Виден весь образ с головы до ног\n• Одежда и аксессуары хорошо видны",
        analyzingStyle: "🔍 Анализируем ваш стиль...\n\nЭто займёт несколько секунд.",
        styleResultTitle: "✨ Результат анализа стиля",
        totalScore: "Общая оценка",
        contextCoefficient: "Соответствие контексту",
        perfectMatch: "Идеально подходит",
        goodMatch: "Хорошо подходит",
        normalMatch: "Нормально",
        weakMatch: "Слабо подходит",
        poorMatch: "Не подходит",
        colorHarmony: "🎨 Гармония цветов",
        fit: "👔 Посадка одежды",
        styleConsistency: "🎯 Единство стиля",
        accessories: "💎 Аксессуары",
        seasonality: "🌡️ Сезонность",
        contextMatch: "🎭 Соответствие контексту",
        strengths: "💪 Сильные стороны",
        improvements: "🔧 Что улучшить",
        recommendations: "💡 Рекомендации",
        charged: "Списано:",
        remaining: "Остаток:",
        backToMenu: "⬅️ В меню"
    },
    EN: {
        selectCategory: "👔 Choose the style purpose:",
        casualTitle: "👕 Casual style",
        casualDesc: "For everyday life: walks, meeting friends, shopping.",
        workTitle: "💼 Work / Study",
        workDesc: "For office, study, business situations.",
        dateTitle: "❤️ Date",
        dateDesc: "For romantic context.",
        socialTitle: "📱 Social media / Public image",
        socialDesc: "For photos, videos, content, personal brand.",
        eventTitle: "🎉 Event",
        eventDesc: "Parties, events, going out.",
        customTitle: "✏️ Custom",
        customDesc: "Describe your context briefly.",
        enterCustomDesc: "✏️ Enter a brief description of the context (4-30 characters):",
        invalidCustomDesc: "❌ Description must be 4-30 characters. Try again:",
        sendFullBodyPhoto: "📸 Send a FULL BODY photo\n\nRequirements:\n• Good lighting\n• Full outfit visible from head to toe\n• Clothes and accessories clearly visible",
        analyzingStyle: "🔍 Analyzing your style...\n\nThis will take a few seconds.",
        styleResultTitle: "✨ Style Analysis Result",
        totalScore: "Total score",
        contextCoefficient: "Context match",
        perfectMatch: "Perfect match",
        goodMatch: "Good match",
        normalMatch: "Acceptable",
        weakMatch: "Weak match",
        poorMatch: "Poor match",
        colorHarmony: "🎨 Color harmony",
        fit: "👔 Fit",
        styleConsistency: "🎯 Style consistency",
        accessories: "💎 Accessories",
        seasonality: "🌡️ Seasonality",
        contextMatch: "🎭 Context match",
        strengths: "💪 Strengths",
        improvements: "🔧 What to improve",
        recommendations: "💡 Recommendations",
        charged: "Charged:",
        remaining: "Remaining:",
        backToMenu: "⬅️ Menu"
    },
    ES: {
        selectCategory: "👔 Elige para qué es el estilo:",
        casualTitle: "👕 Estilo casual",
        casualDesc: "Para la vida cotidiana: paseos, encuentros con amigos, compras.",
        workTitle: "💼 Trabajo / Estudio",
        workDesc: "Para oficina, estudios, situaciones de negocios.",
        dateTitle: "❤️ Cita",
        dateDesc: "Para contexto romántico.",
        socialTitle: "📱 Redes sociales / Imagen pública",
        socialDesc: "Para fotos, videos, contenido, marca personal.",
        eventTitle: "🎉 Evento",
        eventDesc: "Fiestas, eventos, salidas.",
        customTitle: "✏️ Personalizado",
        customDesc: "Describe tu contexto brevemente.",
        enterCustomDesc: "✏️ Ingresa una breve descripción del contexto (4-30 caracteres):",
        invalidCustomDesc: "❌ La descripción debe tener 4-30 caracteres. Intenta de nuevo:",
        sendFullBodyPhoto: "📸 Envía una foto de CUERPO COMPLETO\n\nRequisitos:\n• Buena iluminación\n• Outfit completo visible de cabeza a pies\n• Ropa y accesorios claramente visibles",
        analyzingStyle: "🔍 Analizando tu estilo...\n\nEsto tomará unos segundos.",
        styleResultTitle: "✨ Resultado del análisis de estilo",
        totalScore: "Puntuación total",
        contextCoefficient: "Adecuación al contexto",
        perfectMatch: "Coincidencia perfecta",
        goodMatch: "Buena coincidencia",
        normalMatch: "Aceptable",
        weakMatch: "Coincidencia débil",
        poorMatch: "No coincide",
        colorHarmony: "🎨 Armonía de colores",
        fit: "👔 Ajuste",
        styleConsistency: "🎯 Consistencia de estilo",
        accessories: "💎 Accesorios",
        seasonality: "🌡️ Estacionalidad",
        contextMatch: "🎭 Adecuación al contexto",
        strengths: "💪 Fortalezas",
        improvements: "🔧 Qué mejorar",
        recommendations: "💡 Recomendaciones",
        charged: "Cobrado:",
        remaining: "Restante:",
        backToMenu: "⬅️ Menú"
    },
    FR: {
        selectCategory: "👔 Choisissez l'objectif du style:",
        casualTitle: "👕 Style décontracté",
        casualDesc: "Pour la vie quotidienne: promenades, rencontres entre amis, shopping.",
        workTitle: "💼 Travail / Études",
        workDesc: "Pour le bureau, les études, les situations professionnelles.",
        dateTitle: "❤️ Rendez-vous",
        dateDesc: "Pour un contexte romantique.",
        socialTitle: "📱 Réseaux sociaux / Image publique",
        socialDesc: "Pour photos, vidéos, contenu, marque personnelle.",
        eventTitle: "🎉 Événement",
        eventDesc: "Fêtes, événements, sorties.",
        customTitle: "✏️ Personnalisé",
        customDesc: "Décrivez brièvement votre contexte.",
        enterCustomDesc: "✏️ Entrez une brève description du contexte (4-30 caractères):",
        invalidCustomDesc: "❌ La description doit contenir 4-30 caractères. Réessayez:",
        sendFullBodyPhoto: "📸 Envoyez une photo en PIED\n\nExigences:\n• Bon éclairage\n• Tenue complète visible de la tête aux pieds\n• Vêtements et accessoires clairement visibles",
        analyzingStyle: "🔍 Analyse de votre style...\n\nCela prendra quelques secondes.",
        styleResultTitle: "✨ Résultat de l'analyse de style",
        totalScore: "Score total",
        contextCoefficient: "Adéquation au contexte",
        perfectMatch: "Correspondance parfaite",
        goodMatch: "Bonne correspondance",
        normalMatch: "Acceptable",
        weakMatch: "Faible correspondance",
        poorMatch: "Ne correspond pas",
        colorHarmony: "🎨 Harmonie des couleurs",
        fit: "👔 Coupe",
        styleConsistency: "🎯 Cohérence du style",
        accessories: "💎 Accessoires",
        seasonality: "🌡️ Saisonnalité",
        contextMatch: "🎭 Adéquation au contexte",
        strengths: "💪 Points forts",
        improvements: "🔧 À améliorer",
        recommendations: "💡 Recommandations",
        charged: "Facturé:",
        remaining: "Restant:",
        backToMenu: "⬅️ Menu"
    },
    PT: {
        selectCategory: "👔 Escolha o propósito do estilo:",
        casualTitle: "👕 Estilo casual",
        casualDesc: "Para o dia a dia: passeios, encontros com amigos, compras.",
        workTitle: "💼 Trabalho / Estudo",
        workDesc: "Para escritório, estudos, situações de negócios.",
        dateTitle: "❤️ Encontro",
        dateDesc: "Para contexto romântico.",
        socialTitle: "📱 Redes sociais / Imagem pública",
        socialDesc: "Para fotos, vídeos, conteúdo, marca pessoal.",
        eventTitle: "🎉 Evento",
        eventDesc: "Festas, eventos, saídas.",
        customTitle: "✏️ Personalizado",
        customDesc: "Descreva seu contexto brevemente.",
        enterCustomDesc: "✏️ Digite uma breve descrição do contexto (4-30 caracteres):",
        invalidCustomDesc: "❌ A descrição deve ter 4-30 caracteres. Tente novamente:",
        sendFullBodyPhoto: "📸 Envie uma foto de CORPO INTEIRO\n\nRequisitos:\n• Boa iluminação\n• Visual completo visível da cabeça aos pés\n• Roupas e acessórios claramente visíveis",
        analyzingStyle: "🔍 Analisando seu estilo...\n\nIsso levará alguns segundos.",
        styleResultTitle: "✨ Resultado da análise de estilo",
        totalScore: "Pontuação total",
        contextCoefficient: "Adequação ao contexto",
        perfectMatch: "Combinação perfeita",
        goodMatch: "Boa combinação",
        normalMatch: "Aceitável",
        weakMatch: "Combinação fraca",
        poorMatch: "Não combina",
        colorHarmony: "🎨 Harmonia de cores",
        fit: "👔 Caimento",
        styleConsistency: "🎯 Consistência do estilo",
        accessories: "💎 Acessórios",
        seasonality: "🌡️ Sazonalidade",
        contextMatch: "🎭 Adequação ao contexto",
        strengths: "💪 Pontos fortes",
        improvements: "🔧 O que melhorar",
        recommendations: "💡 Recomendações",
        charged: "Cobrado:",
        remaining: "Restante:",
        backToMenu: "⬅️ Menu"
    },
    UA: {
        selectCategory: "👔 Виберіть для чого стиль:",
        casualTitle: "👕 Повсякденний стиль",
        casualDesc: "Для повсякденного життя: прогулянки, зустрічі з друзями, шопінг.",
        workTitle: "💼 Робота / навчання",
        workDesc: "Для офісу, навчання, ділових ситуацій.",
        dateTitle: "❤️ Побачення",
        dateDesc: "Для романтичного контексту.",
        socialTitle: "📱 Соцмережі / публічний образ",
        socialDesc: "Для фото, відео, контенту, особистого бренду.",
        eventTitle: "🎉 Захід",
        eventDesc: "Вечірки, події, виходи \"в люди\".",
        customTitle: "✏️ Свій варіант",
        customDesc: "Опишіть свій контекст коротко.",
        enterCustomDesc: "✏️ Введіть короткий опис контексту (4-30 символів):",
        invalidCustomDesc: "❌ Опис повинен бути від 4 до 30 символів. Спробуйте ще:",
        sendFullBodyPhoto: "📸 Надішліть фото на ПОВНИЙ ЗРІСТ\n\nВимоги:\n• Гарне освітлення\n• Видно весь образ з голови до ніг\n• Одяг та аксесуари добре видно",
        analyzingStyle: "🔍 Аналізуємо ваш стиль...\n\nЦе займе кілька секунд.",
        styleResultTitle: "✨ Результат аналізу стилю",
        totalScore: "Загальна оцінка",
        contextCoefficient: "Відповідність контексту",
        perfectMatch: "Ідеально підходить",
        goodMatch: "Добре підходить",
        normalMatch: "Прийнятно",
        weakMatch: "Слабко підходить",
        poorMatch: "Не підходить",
        colorHarmony: "🎨 Гармонія кольорів",
        fit: "👔 Посадка одягу",
        styleConsistency: "🎯 Єдність стилю",
        accessories: "💎 Аксесуари",
        seasonality: "🌡️ Сезонність",
        contextMatch: "🎭 Відповідність контексту",
        strengths: "💪 Сильні сторони",
        improvements: "🔧 Що покращити",
        recommendations: "💡 Рекомендації",
        charged: "Списано:",
        remaining: "Залишок:",
        backToMenu: "⬅️ Меню"
    }
};

export const getStyleUI = (lang: Language) => styleUITranslations[lang] || styleUITranslations.EN;

// Получение названия категории на нужном языке
export const getCategoryName = (category: StyleCategory, lang: Language): string => {
    const ui = getStyleUI(lang);
    const names: Record<StyleCategory, string> = {
        casual: ui.casualTitle,
        work: ui.workTitle,
        date: ui.dateTitle,
        social: ui.socialTitle,
        event: ui.eventTitle,
        custom: ui.customTitle
    };
    return names[category];
};

// Получение описания категории на нужном языке
export const getCategoryDescription = (category: StyleCategory, lang: Language): string => {
    const ui = getStyleUI(lang);
    const descriptions: Record<StyleCategory, string> = {
        casual: ui.casualDesc,
        work: ui.workDesc,
        date: ui.dateDesc,
        social: ui.socialDesc,
        event: ui.eventDesc,
        custom: ui.customDesc
    };
    return descriptions[category];
};
