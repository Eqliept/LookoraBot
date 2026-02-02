import type { Language } from "../types/index.js";
export interface FormatParams {
    [key: string]: string | number;
}
declare const translations: Record<Language, Record<string, string>>;
/**
 * Форматирует строку с параметрами
 * Заменяет { $param } на значения из объекта params
 * Правильно обрабатывает \n для переносов строк
 */
export declare function formatMessage(template: string, params?: FormatParams): string;
/**
 * Получает перевод по ключу и языку
 * Поддерживает форматирование с параметрами
 */
export declare function t(key: string, lang: Language, params?: FormatParams): string;
/**
 * Создает функцию перевода для конкретного языка
 * Удобно для использования в обработчиках
 */
export declare function createTranslator(lang: Language): (key: string, params?: FormatParams) => string;
/**
 * Проверяет существование ключа перевода
 */
export declare function hasTranslation(key: string, lang?: Language): boolean;
/**
 * Получает все ключи переводов
 */
export declare function getTranslationKeys(lang?: Language): string[];
/**
 * Кеш для хранения переводов (для масштабируемости)
 */
declare class TranslationCache {
    private cache;
    private maxSize;
    get(key: string, lang: Language): string | undefined;
    set(key: string, lang: Language, value: string): void;
    clear(): void;
    getSize(): number;
}
export declare const translationCache: TranslationCache;
/**
 * Получает перевод с кешированием (для масштабируемости)
 */
export declare function tCached(key: string, lang: Language, params?: FormatParams): string;
/**
 * Утилита для создания многострочных сообщений
 * Автоматически добавляет переносы строк между частями
 */
export declare function multiline(...lines: string[]): string;
/**
 * Создает сообщение с разделителями
 */
export declare function section(title: string, content: string, separator?: string): string;
/**
 * Создает список с маркерами
 */
export declare function bulletList(items: string[], marker?: string): string;
/**
 * Создает нумерованный список
 */
export declare function numberedList(items: string[]): string;
/**
 * Экспорт всех переводов для использования в других модулях
 */
export { translations };
export type { Language };
//# sourceMappingURL=i18n.d.ts.map