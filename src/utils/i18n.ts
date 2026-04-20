import type { Language } from "../types/index.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ru = require("../languages/ru.json");
const en = require("../languages/en.json");
const ua = require("../languages/ua.json");
const es = require("../languages/es.json");
const fr = require("../languages/fr.json");
const pt = require("../languages/pt.json");

export interface FormatParams {
    [key: string]: string | number;
}

const translations: Record<Language, Record<string, string>> = {
    RU: ru as Record<string, string>,
    EN: en as Record<string, string>,
    UA: ua as Record<string, string>,
    ES: es as Record<string, string>,
    FR: fr as Record<string, string>,
    PT: pt as Record<string, string>,
};

export function formatMessage(template: string, params?: FormatParams): string {
    let formatted = template;

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const placeholder = new RegExp(`\\{\\s*\\$${key}\\s*\\}`, 'g');
            formatted = formatted.replace(placeholder, String(value));
        });
    }

    formatted = formatted.replace(/\\n/g, '\n');

    return formatted;
}

export function t(key: string, lang: Language, params?: FormatParams): string {
    const langTranslations = translations[lang] || translations.EN;
    const template = langTranslations[key] || translations.EN[key] || key;

    return formatMessage(template, params);
}

export function createTranslator(lang: Language) {
    return (key: string, params?: FormatParams) => t(key, lang, params);
}

export function hasTranslation(key: string, lang?: Language): boolean {
    if (lang) {
        return key in (translations[lang] || {});
    }

    return Object.values(translations).some(langTranslations => key in langTranslations);
}

export function getTranslationKeys(lang?: Language): string[] {
    if (lang) {
        return Object.keys(translations[lang] || {});
    }

    const allKeys = new Set<string>();
    Object.values(translations).forEach(langTranslations => {
        Object.keys(langTranslations).forEach(key => allKeys.add(key));
    });
    return Array.from(allKeys);
}

class TranslationCache {
    private cache = new Map<string, string>();
    private maxSize = 1000;

    get(key: string, lang: Language): string | undefined {
        return this.cache.get(`${lang}:${key}`);
    }

    set(key: string, lang: Language, value: string): void {
        const cacheKey = `${lang}:${key}`;

        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(cacheKey, value);
    }

    clear(): void {
        this.cache.clear();
    }

    getSize(): number {
        return this.cache.size;
    }
}

export const translationCache = new TranslationCache();

export function tCached(key: string, lang: Language, params?: FormatParams): string {

    if (params) {
        return t(key, lang, params);
    }

    const cached = translationCache.get(key, lang);
    if (cached !== undefined) {
        return cached;
    }

    const translated = t(key, lang);
    translationCache.set(key, lang, translated);

    return translated;
}

export function multiline(...lines: string[]): string {
    return lines.filter(line => line).join('\n');
}

export function section(title: string, content: string, separator: string = '\n\n'): string {
    return `${title}${separator}${content}`;
}

export function bulletList(items: string[], marker: string = '•'): string {
    return items.map(item => `${marker} ${item}`).join('\n');
}

export function numberedList(items: string[]): string {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

export { translations };
export type { Language };
