import type { Language } from "../types/index.js";
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { ADMIN_ID } from "../constants/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let botInstance: any = null;

export const setBotInstance = (bot: any) => {
    botInstance = bot;
};

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

const transports: winston.transport[] = [

    new winston.transports.Console({
        format: consoleFormat,
    }),

    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: fileFormat,
    }),

    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: fileFormat,
    }),
];

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    transports,
});

export const logUserAction = (
    userId: number,
    action: string,
    details?: Record<string, any>
) => {
    logger.info(`User action: ${action}`, {
        userId,
        action,
        ...details,
    });
};

export const logPayment = (
    userId: number,
    amount: number,
    status: 'pending' | 'success' | 'failed',
    details?: Record<string, any>
) => {
    logger.info(`Payment ${status}`, {
        userId,
        amount,
        status,
        ...details,
    });
};

export const logError = (
    error: Error,
    context: string,
    details?: Record<string, any>
) => {
    logger.error(`Error in ${context}: ${error.message}`, {
        context,
        error: {
            message: error.message,
            stack: error.stack,
        },
        ...details,
    });
};

export const logPurchase = (
    userId: number,
    coins: number,
    amountUsd: number,
    method: string,
    details?: Record<string, any>
) => {
    logger.info(`💰 Purchase completed`, {
        userId,
        coins,
        amountUsd,
        method,
        timestamp: new Date().toISOString(),
        ...details,
    });
    metrics.recordPayment(amountUsd, userId);
};

export const logAnalysis = (
    userId: number,
    analysisType: 'appearance' | 'style',
    cost: number,
    success: boolean,
    details?: Record<string, any>
) => {
    logger.info(`🔍 Analysis ${success ? 'completed' : 'failed'}`, {
        userId,
        analysisType,
        cost,
        success,
        timestamp: new Date().toISOString(),
        ...details,
    });
};

export const logCoinsOperation = (
    userId: number,
    operation: 'give' | 'take' | 'deduct' | 'add',
    amount: number,
    reason: string,
    details?: Record<string, any>
) => {
    logger.info(`💎 Coins ${operation}`, {
        userId,
        operation,
        amount,
        reason,
        timestamp: new Date().toISOString(),
        ...details,
    });
};

export const notifyAdminAboutError = async (
    error: Error,
    context: string,
    userId?: number,
    details?: Record<string, any>
) => {
    logError(error, context, { userId, ...details });

    if (!botInstance) {
        logger.warn('Bot instance not set, cannot notify admin');
        return;
    }

    try {
        const message = `🚨 **КРИТИЧЕСКАЯ ОШИБКА**

📍 **Контекст:** \`${context}\`
❌ **Ошибка:** ${error.message}
${userId ? `👤 **Пользователь:** ${userId}` : ''}
⏰ **Время:** ${new Date().toLocaleString('ru')}

\`\`\`
${error.stack?.slice(0, 500) || 'Stack trace unavailable'}
\`\`\``;

        await botInstance.api.sendMessage(ADMIN_ID, message, { parse_mode: "Markdown" });
        logger.info('Admin notified about critical error');
    } catch (notifyError) {
        logger.error('Failed to notify admin about error', { notifyError });
    }
};

export const logAPICall = (
    service: string,
    endpoint: string,
    duration: number,
    success: boolean,
    details?: Record<string, any>
) => {
    logger.http(`API call to ${service}`, {
        service,
        endpoint,
        duration,
        success,
        ...details,
    });
};

class MetricsCollector {
    private metrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalUsers: new Set<number>(),
        totalPayments: 0,
        totalRevenue: 0,
        responseTimeSum: 0,
        responseTimeCount: 0,
    };

    recordRequest(success: boolean, userId?: number): void {
        this.metrics.totalRequests++;
        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
        if (userId) {
            this.metrics.totalUsers.add(userId);
        }
    }

    recordPayment(amount: number, userId: number): void {
        this.metrics.totalPayments++;
        this.metrics.totalRevenue += amount;
        this.metrics.totalUsers.add(userId);
    }

    recordResponseTime(timeMs: number): void {
        this.metrics.responseTimeSum += timeMs;
        this.metrics.responseTimeCount++;
    }

    getMetrics() {
        return {
            ...this.metrics,
            totalUniqueUsers: this.metrics.totalUsers.size,
            averageResponseTime:
                this.metrics.responseTimeCount > 0
                    ? this.metrics.responseTimeSum / this.metrics.responseTimeCount
                    : 0,
            successRate:
                this.metrics.totalRequests > 0
                    ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
                    : 0,
        };
    }

    reset(): void {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalUsers: new Set<number>(),
            totalPayments: 0,
            totalRevenue: 0,
            responseTimeSum: 0,
            responseTimeCount: 0,
        };
    }
}

export const metrics = new MetricsCollector();

setInterval(() => {
    const currentMetrics = metrics.getMetrics();
    logger.info('📊 Metrics report', currentMetrics);
}, 30 * 60 * 1000);

export class PerformanceMonitor {
    private timers = new Map<string, number>();

    start(label: string): void {
        this.timers.set(label, Date.now());
    }

    end(label: string): number {
        const startTime = this.timers.get(label);
        if (!startTime) {
            logger.warn(`Performance monitor: no start time for ${label}`);
            return 0;
        }

        const duration = Date.now() - startTime;
        this.timers.delete(label);

        metrics.recordResponseTime(duration);

        if (duration > 1000) {
            logger.warn(`Slow operation: ${label} took ${duration}ms`);
        }

        return duration;
    }

    measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
        return this.measureSync(label, fn);
    }

    private async measureSync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        this.start(label);
        try {
            const result = await fn();
            const duration = this.end(label);
            logger.debug(`${label} completed in ${duration}ms`);
            return result;
        } catch (error) {
            this.end(label);
            throw error;
        }
    }
}

export const performanceMonitor = new PerformanceMonitor();
