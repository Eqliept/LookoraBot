import "dotenv/config";
import type { Language, PhotoValidationResult, AppearanceAnalysisResult, StyleCategory, StyleAnalysisResult, HairAnalysisResult, BattleAnalysisResult } from "../types/index.js";
export declare const analysisResults: Map<number, AppearanceAnalysisResult>;
/**
 * Проверка качества фото через GPT Vision
 * Используем gpt-4o-mini как самую дешёвую модель с поддержкой Vision
 */
export declare const validatePhoto: (photoUrl: string, type: "front" | "side", lang?: Language) => Promise<PhotoValidationResult>;
/**
 * Анализ внешности через GPT Vision
 * Возвращает детализированные оценки по категориям
 */
export declare const analyzeAppearance: (frontPhotoUrl: string, sidePhotoUrl: string, lang?: Language) => Promise<AppearanceAnalysisResult>;
/**
 * Генерация советов по улучшению на основе результатов анализа
 */
export declare const getImprovementTips: (result: AppearanceAnalysisResult, lang?: Language) => Promise<string>;
/**
 * Получить URL файла из Telegram
 */
export declare const getTelegramFileUrl: (botToken: string, fileId: string) => Promise<string | null>;
export declare const styleAnalysisResults: Map<number, StyleAnalysisResult>;
/**
 * Валидация фото для анализа стиля (полный рост)
 */
export declare const validateStylePhoto: (photoUrl: string, lang?: Language) => Promise<PhotoValidationResult>;
/**
 * Анализ стиля через GPT Vision
 */
export declare const analyzeStyle: (photoUrl: string, category: StyleCategory, customDescription: string | undefined, lang?: Language) => Promise<StyleAnalysisResult>;
/**
 * Анализ волос и определение формы лица
 */
export declare const analyzeHair: (photoUrl: string, lang?: Language) => Promise<HairAnalysisResult & {
    gender?: "male" | "female";
}>;
/**
 * Подбор прически на основе анализа
 */
export declare const suggestHairstyle: (photoUrl: string, hairAnalysis: HairAnalysisResult, lang?: Language) => Promise<string>;
/**
 * Советы по улучшению текущей прически
 */
export declare const improveCurrentHair: (photoUrl: string, hairAnalysis: HairAnalysisResult, lang?: Language) => Promise<string>;
/**
 * Генерация инструкций для барбера
 */
export declare const generateBarberInstructions: (hairstyleSuggestion: string, lang?: Language, gender?: "male" | "female") => Promise<string>;
/**
 * Анализ баттла внешности - сравнение двух человек
 */
export declare const analyzeBattle: (player1FrontUrl: string, player1SideUrl: string, player2FrontUrl: string, player2SideUrl: string, lang?: Language) => Promise<BattleAnalysisResult>;
//# sourceMappingURL=gpt.service.d.ts.map