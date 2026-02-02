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
    grooming: number;          // Ухоженность и опрятность
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
    eyebrows: number;    // Брови
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
    eyebrows: string;
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
    eyebrows: string;
}

export interface GPTTranslation {
    errorLanguage: string;
    labels: GPTTranslationLabels;
}

// Результат анализа волос
export interface HairScores {
    health: number;        // Здоровье волос
    volume: number;        // Объем
    texture: number;       // Текстура/структура
    color: number;         // Цвет (натуральность/качество окрашивания)
    styling: number;       // Укладка
    maintenance: number;   // Ухоженность
}

export interface HairAnalysisResult {
    scores: HairScores;
    totalScore: number;
    faceShape: string;          // Форма лица
    currentStyle: string;       // Описание текущей прически
    strengths: string[];        // Сильные стороны
    improvements: string[];     // Что можно улучшить
}

export interface HairUITranslations {
    totalScore: string;
    faceShape: string;
    currentStyle: string;
    details: string;
    health: string;
    volume: string;
    texture: string;
    color: string;
    styling: string;
    maintenance: string;
    strengths: string;
    improvements: string;
    suggestHairstyleButton: string;
    improveCurrentButton: string;
    backButton: string;
    barberInstructionsButton: string;
    generatingSuggestion: string;
    generatingImprovement: string;
    generatingBarberText: string;
    hairstyleSuggestionTitle: string;
    improvementTitle: string;
    barberInstructionsTitle: string;
    backToHairMenu: string;
}
