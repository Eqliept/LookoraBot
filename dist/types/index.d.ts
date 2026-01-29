export type Language = "RU" | "EN" | "ES" | "PT" | "FR" | "UA";
export interface User {
    id: number;
    language: Language;
    coins: number;
}
export interface UserPhotoSession {
    stage: "front" | "side";
    frontPhotoUrl?: string;
}
export type StyleCategory = "casual" | "work" | "date" | "social" | "event" | "custom";
export interface StylePhotoSession {
    category: StyleCategory;
    customDescription?: string;
}
export interface StyleScores {
    colorHarmony: number;
    fit: number;
    styleConsistency: number;
    accessories: number;
    seasonality: number;
    contextMatch: number;
}
export interface StyleAnalysisResult {
    scores: StyleScores;
    totalScore: number;
    overallCoefficient: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
}
export interface PhotoValidationResult {
    isValid: boolean;
    error?: string;
}
export interface AppearanceScores {
    eyes: number;
    nose: number;
    lips: number;
    skin: number;
    jawline: number;
    cheekbones: number;
    symmetry: number;
    harmony: number;
}
export interface AppearanceAnalysisResult {
    scores: AppearanceScores;
    totalScore: number;
    overallCoefficient: number;
    weakPoints: string[];
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
//# sourceMappingURL=index.d.ts.map