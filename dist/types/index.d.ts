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
    grooming: number;
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
    eyebrows: number;
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
    rateAgainButton: string;
    looksMaxingButton: string;
    looksMaxingTitle: string;
    looksMaxingTier: string;
    looksMaxingDescription: string;
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
export interface HairScores {
    health: number;
    volume: number;
    texture: number;
    color: number;
    styling: number;
    maintenance: number;
}
export interface HairAnalysisResult {
    scores: HairScores;
    totalScore: number;
    faceShape: string;
    currentStyle: string;
    strengths: string[];
    improvements: string[];
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
export interface BattlePlayerResult {
    scores: AppearanceScores;
    totalScore: number;
    overallCoefficient: number;
}
export interface BattleAnalysisResult {
    player1: BattlePlayerResult;
    player2: BattlePlayerResult;
    verdict: string;
}
//# sourceMappingURL=index.d.ts.map