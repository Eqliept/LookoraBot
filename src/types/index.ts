// Языки
export type Language = "RU" | "EN" | "ES" | "PT" | "FR" | "UA";

// Пользователь
export interface User {
    id: number;
    language: Language;
    coins: number;
}

// Сессия сбора фото
export interface UserPhotoSession {
    stage: "front" | "side";
    frontPhotoUrl?: string;
}

// Категории стиля
export type StyleCategory = "casual" | "work" | "date" | "social" | "event" | "custom";

// Сессия оценки стиля
export interface StylePhotoSession {
    category: StyleCategory;
    customDescription?: string;
}

// Результат анализа стиля
export interface StyleScores {
    colorHarmony: number;      // Гармония цветов
    fit: number;               // Посадка одежды
    styleConsistency: number;  // Единство стиля
    accessories: number;       // Аксессуары
    seasonality: number;       // Соответствие сезону
    contextMatch: number;      // Соответствие контексту
}

export interface StyleAnalysisResult {
    scores: StyleScores;
    totalScore: number;
    overallCoefficient: number; // Коэффициент соответствия контексту (0.3-1.0)
    strengths: string[];       // Сильные стороны
    improvements: string[];    // Что улучшить
    recommendations: string[]; // Рекомендации
}

// Результат валидации фото
export interface PhotoValidationResult {
    isValid: boolean;
    error?: string;
}

// Детализированный результат анализа внешности
export interface AppearanceScores {
    eyes: number;        // Глаза
    nose: number;        // Нос
    lips: number;        // Губы
    skin: number;        // Кожа
    jawline: number;     // Челюсть/подбородок
    cheekbones: number;  // Скулы
    symmetry: number;    // Симметрия
    harmony: number;     // Общая гармония
}

export interface AppearanceAnalysisResult {
    scores: AppearanceScores;
    totalScore: number;
    overallCoefficient: number;  // Коэффициент общего впечатления (0.5-1.0)
    weakPoints: string[];  // Слабые места для улучшения
}

export interface AppearanceUITranslations {
    totalScore: string;
    impression: string;
    excellent: string;
    good: string;
    normal: string;
    average: string;
    low: string;
    details: string;
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    jawline: string;
    cheekbones: string;
    symmetry: string;
    harmony: string;
    charged: string;
    remaining: string;
    tipsButton: string;
    backButton: string;
    tipsTitle: string;
    noAnalysisYet: string;
    notEnoughCoins: string;
    youHave: string;
    generatingTips: string;
    lookCoins: string;
    backToMenu: string;
}

export interface GPTTranslationLabels {
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    jawline: string;
    cheekbones: string;
    symmetry: string;
    harmony: string;
}

export interface GPTTranslation {
    errorLanguage: string;
    labels: GPTTranslationLabels;
}
