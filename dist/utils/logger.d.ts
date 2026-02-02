import winston from "winston";
export declare const setBotInstance: (bot: any) => void;
export declare const logger: winston.Logger;
export declare const logUserAction: (userId: number, action: string, details?: Record<string, any>) => void;
export declare const logPayment: (userId: number, amount: number, status: "pending" | "success" | "failed", details?: Record<string, any>) => void;
export declare const logError: (error: Error, context: string, details?: Record<string, any>) => void;
export declare const logPurchase: (userId: number, coins: number, amountUsd: number, method: string, details?: Record<string, any>) => void;
export declare const logAnalysis: (userId: number, analysisType: "appearance" | "style", cost: number, success: boolean, details?: Record<string, any>) => void;
export declare const logCoinsOperation: (userId: number, operation: "give" | "take" | "deduct" | "add", amount: number, reason: string, details?: Record<string, any>) => void;
export declare const notifyAdminAboutError: (error: Error, context: string, userId?: number, details?: Record<string, any>) => Promise<void>;
export declare const logAPICall: (service: string, endpoint: string, duration: number, success: boolean, details?: Record<string, any>) => void;
declare class MetricsCollector {
    private metrics;
    recordRequest(success: boolean, userId?: number): void;
    recordPayment(amount: number, userId: number): void;
    recordResponseTime(timeMs: number): void;
    getMetrics(): {
        totalUniqueUsers: number;
        averageResponseTime: number;
        successRate: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        totalUsers: Set<number>;
        totalPayments: number;
        totalRevenue: number;
        responseTimeSum: number;
        responseTimeCount: number;
    };
    reset(): void;
}
export declare const metrics: MetricsCollector;
export declare class PerformanceMonitor {
    private timers;
    start(label: string): void;
    end(label: string): number;
    measure<T>(label: string, fn: () => Promise<T>): Promise<T>;
    private measureSync;
}
export declare const performanceMonitor: PerformanceMonitor;
export {};
//# sourceMappingURL=logger.d.ts.map