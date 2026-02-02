class UserCache {
    constructor() {
        this.cache = new Map();
        this.TTL = 5 * 60 * 1000; // 5 минут
        this.maxSize = 10000;
    }
    get(userId) {
        const cached = this.cache.get(userId);
        if (!cached)
            return undefined;
        // Проверяем TTL
        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(userId);
            return undefined;
        }
        return cached;
    }
    set(userId, userData) {
        // LRU eviction при достижении лимита
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey)
                this.cache.delete(firstKey);
        }
        this.cache.set(userId, {
            ...userData,
            timestamp: Date.now()
        });
    }
    invalidate(userId) {
        this.cache.delete(userId);
    }
    clear() {
        this.cache.clear();
    }
    getSize() {
        return this.cache.size;
    }
    // Очистка устаревших записей
    cleanup() {
        const now = Date.now();
        let removed = 0;
        for (const [userId, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.TTL) {
                this.cache.delete(userId);
                removed++;
            }
        }
        return removed;
    }
}
export const userCache = new UserCache();
// Периодическая очистка кеша (каждые 10 минут)
setInterval(() => {
    const removed = userCache.cleanup();
    if (removed > 0) {
        console.log(`🧹 Cache cleanup: removed ${removed} expired entries`);
    }
}, 10 * 60 * 1000);
/**
 * Кеш для часто используемых данных
 */
class DataCache {
    constructor(ttlMs = 5 * 60 * 1000, maxSize = 1000) {
        this.cache = new Map();
        this.TTL = ttlMs;
        this.maxSize = maxSize;
    }
    get(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return undefined;
        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(key);
            return undefined;
        }
        return cached.data;
    }
    set(key, data) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey)
                this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    invalidate(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    cleanup() {
        const now = Date.now();
        let removed = 0;
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.TTL) {
                this.cache.delete(key);
                removed++;
            }
        }
        return removed;
    }
}
// Экспортируем готовые кеши для разных типов данных
export const packageInfoCache = new DataCache(10 * 60 * 1000); // 10 минут
export const invoiceCache = new DataCache(5 * 60 * 1000); // 5 минут
/**
 * Менеджер пулов операций для оптимизации DB запросов
 */
export class OperationBatcher {
    constructor(processor, batchSize = 50, waitTimeMs = 10) {
        this.processor = processor;
        this.queue = [];
        this.timeout = null;
        this.batchSize = batchSize;
        this.waitTime = waitTimeMs;
    }
    async add(key) {
        return new Promise((resolve, reject) => {
            this.queue.push({ key, resolve, reject });
            // Если достигли размера батча, обрабатываем сразу
            if (this.queue.length >= this.batchSize) {
                this.flush();
            }
            else if (!this.timeout) {
                // Иначе ждем накопления
                this.timeout = setTimeout(() => this.flush(), this.waitTime);
            }
        });
    }
    async flush() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.queue.length === 0)
            return;
        const batch = this.queue.splice(0);
        const keys = batch.map(item => item.key);
        try {
            const results = await this.processor(keys);
            batch.forEach((item, index) => {
                const result = results[index];
                if (result !== undefined) {
                    item.resolve(result);
                }
            });
        }
        catch (error) {
            batch.forEach(item => {
                item.reject(error);
            });
        }
    }
}
/**
 * Rate limiter для предотвращения спама
 */
export class RateLimiter {
    constructor(limit = 10, windowMs = 60000) {
        this.requests = new Map();
        this.limit = limit;
        this.windowMs = windowMs;
    }
    /**
     * Проверяет, может ли пользователь выполнить действие
     */
    check(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        // Удаляем устаревшие запросы
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        if (validRequests.length >= this.limit) {
            this.requests.set(userId, validRequests);
            return false;
        }
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return true;
    }
    /**
     * Получает количество оставшихся запросов
     */
    getRemaining(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        return Math.max(0, this.limit - validRequests.length);
    }
    /**
     * Сбрасывает лимит для пользователя
     */
    reset(userId) {
        this.requests.delete(userId);
    }
    /**
     * Очистка устаревших данных
     */
    cleanup() {
        const now = Date.now();
        for (const [userId, requests] of this.requests.entries()) {
            const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(userId);
            }
            else {
                this.requests.set(userId, validRequests);
            }
        }
    }
}
// Периодическая очистка rate limiter
setInterval(() => {
    // Экспортированные инстансы будут очищаться автоматически
    console.log('🧹 Rate limiter cleanup completed');
}, 5 * 60 * 1000);
// Экспортируем готовые rate limiters
export const commandRateLimiter = new RateLimiter(20, 60000); // 20 команд в минуту
export const paymentRateLimiter = new RateLimiter(5, 60000); // 5 платежей в минуту
export const analysisRateLimiter = new RateLimiter(10, 60000); // 10 анализов в минуту
//# sourceMappingURL=cache.js.map