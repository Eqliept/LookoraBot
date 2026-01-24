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

// UI переводы для appearance handler
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

// GPT переводы
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
