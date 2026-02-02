interface CachedUser {
    id: number;
    language: string;
    coins: number;
    hasAcceptedAgreement: boolean;
    timestamp: number;
}
declare class UserCache {
    private cache;
    private readonly TTL;
    private readonly maxSize;
    get(userId: number): CachedUser | undefined;
    set(userId: number, userData: Omit<CachedUser, 'timestamp'>): void;
    invalidate(userId: number): void;
    clear(): void;
    getSize(): number;
    cleanup(): number;
}
export declare const userCache: UserCache;
/**
 * Кеш для часто используемых данных
 */
declare class DataCache<T> {
    private cache;
    private readonly TTL;
    private readonly maxSize;
    constructor(ttlMs?: number, maxSize?: number);
    get(key: string): T | undefined;
    set(key: string, data: T): void;
    invalidate(key: string): void;
    clear(): void;
    cleanup(): number;
}
export declare const packageInfoCache: DataCache<any>;
export declare const invoiceCache: DataCache<any>;
/**
 * Менеджер пулов операций для оптимизации DB запросов
 */
export declare class OperationBatcher<T, R> {
    private processor;
    private queue;
    private timeout;
    private readonly batchSize;
    private readonly waitTime;
    constructor(processor: (keys: T[]) => Promise<R[]>, batchSize?: number, waitTimeMs?: number);
    add(key: T): Promise<R>;
    private flush;
}
/**
 * Rate limiter для предотвращения спама
 */
export declare class RateLimiter {
    private requests;
    private readonly limit;
    private readonly windowMs;
    constructor(limit?: number, windowMs?: number);
    /**
     * Проверяет, может ли пользователь выполнить действие
     */
    check(userId: number): boolean;
    /**
     * Получает количество оставшихся запросов
     */
    getRemaining(userId: number): number;
    /**
     * Сбрасывает лимит для пользователя
     */
    reset(userId: number): void;
    /**
     * Очистка устаревших данных
     */
    cleanup(): void;
}
export declare const commandRateLimiter: RateLimiter;
export declare const paymentRateLimiter: RateLimiter;
export declare const analysisRateLimiter: RateLimiter;
export {};
//# sourceMappingURL=cache.d.ts.map