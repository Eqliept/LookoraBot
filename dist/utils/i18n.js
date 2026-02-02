import ru from "../languages/ru.json" with { type: "json" };
import en from "../languages/en.json" with { type: "json" };
import ua from "../languages/ua.json" with { type: "json" };
import es from "../languages/es.json" with { type: "json" };
import fr from "../languages/fr.json" with { type: "json" };
import pt from "../languages/pt.json" with { type: "json" };
// Словари переводов
const translations = {
    RU: ru,
    EN: en,
    UA: ua,
    ES: es,
    FR: fr,
    PT: pt,
};
/**
 * Форматирует строку с параметрами
 * Заменяет { $param } на значения из объекта params
 * Правильно обрабатывает \n для переносов строк
 */
export function formatMessage(template, params) {
    let formatted = template;
    // Заменяем параметры
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const placeholder = new RegExp(`\\{\\s*\\$${key}\\s*\\}`, 'g');
            formatted = formatted.replace(placeholder, String(value));
        });
    }
    // Конвертируем \n в реальные переносы строк
    formatted = formatted.replace(/\\n/g, '\n');
    return formatted;
}
/**
 * Получает перевод по ключу и языку
 * Поддерживает форматирование с параметрами
 */
export function t(key, lang, params) {
    const langTranslations = translations[lang] || translations.EN;
    const template = langTranslations[key] || translations.EN[key] || key;
    return formatMessage(template, params);
}
/**
 * Создает функцию перевода для конкретного языка
 * Удобно для использования в обработчиках
 */
export function createTranslator(lang) {
    return (key, params) => t(key, lang, params);
}
/**
 * Проверяет существование ключа перевода
 */
export function hasTranslation(key, lang) {
    if (lang) {
        return key in (translations[lang] || {});
    }
    // Проверяем во всех языках
    return Object.values(translations).some(langTranslations => key in langTranslations);
}
/**
 * Получает все ключи переводов
 */
export function getTranslationKeys(lang) {
    if (lang) {
        return Object.keys(translations[lang] || {});
    }
    // Объединяем ключи из всех языков
    const allKeys = new Set();
    Object.values(translations).forEach(langTranslations => {
        Object.keys(langTranslations).forEach(key => allKeys.add(key));
    });
    return Array.from(allKeys);
}
/**
 * Кеш для хранения переводов (для масштабируемости)
 */
class TranslationCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 1000;
    }
    get(key, lang) {
        return this.cache.get(`${lang}:${key}`);
    }
    set(key, lang, value) {
        const cacheKey = `${lang}:${key}`;
        // Простая LRU логика
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey)
                this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, value);
    }
    clear() {
        this.cache.clear();
    }
    getSize() {
        return this.cache.size;
    }
}
export const translationCache = new TranslationCache();
/**
 * Получает перевод с кешированием (для масштабируемости)
 */
export function tCached(key, lang, params) {
    // Если есть параметры, не кешируем (так как результат будет разный)
    if (params) {
        return t(key, lang, params);
    }
    // Проверяем кеш
    const cached = translationCache.get(key, lang);
    if (cached !== undefined) {
        return cached;
    }
    // Получаем и кешируем
    const translated = t(key, lang);
    translationCache.set(key, lang, translated);
    return translated;
}
/**
 * Утилита для создания многострочных сообщений
 * Автоматически добавляет переносы строк между частями
 */
export function multiline(...lines) {
    return lines.filter(line => line).join('\n');
}
/**
 * Создает сообщение с разделителями
 */
export function section(title, content, separator = '\n\n') {
    return `${title}${separator}${content}`;
}
/**
 * Создает список с маркерами
 */
export function bulletList(items, marker = '•') {
    return items.map(item => `${marker} ${item}`).join('\n');
}
/**
 * Создает нумерованный список
 */
export function numberedList(items) {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}
/**
 * Экспорт всех переводов для использования в других модулях
 */
export { translations };
//# sourceMappingURL=i18n.js.map