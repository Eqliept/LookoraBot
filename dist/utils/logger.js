import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { ADMIN_ID } from "../constants/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Глобальная ссылка на бота для уведомлений админа
let botInstance = null;
export const setBotInstance = (bot) => {
    botInstance = bot;
};
// Определяем уровни логирования
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Цвета для консоли
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
winston.addColors(colors);
// Формат для консоли
const consoleFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`));
// Формат для файлов
const fileFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json());
// Создаем транспорты
const transports = [
    // Консоль
    new winston.transports.Console({
        format: consoleFormat,
    }),
    // Файл для ошибок
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: fileFormat,
    }),
    // Файл для всех логов
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: fileFormat,
    }),
];
// Создаем логгер
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    transports,
});
// Вспомогательные функции для структурированного логирования
export const logUserAction = (userId, action, details) => {
    logger.info(`User action: ${action}`, {
        userId,
        action,
        ...details,
    });
};
export const logPayment = (userId, amount, status, details) => {
    logger.info(`Payment ${status}`, {
        userId,
        amount,
        status,
        ...details,
    });
};
export const logError = (error, context, details) => {
    logger.error(`Error in ${context}: ${error.message}`, {
        context,
        error: {
            message: error.message,
            stack: error.stack,
        },
        ...details,
    });
};
export const logPurchase = (userId, coins, amountUsd, method, details) => {
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
export const logAnalysis = (userId, analysisType, cost, success, details) => {
    logger.info(`🔍 Analysis ${success ? 'completed' : 'failed'}`, {
        userId,
        analysisType,
        cost,
        success,
        timestamp: new Date().toISOString(),
        ...details,
    });
};
export const logCoinsOperation = (userId, operation, amount, reason, details) => {
    logger.info(`💎 Coins ${operation}`, {
        userId,
        operation,
        amount,
        reason,
        timestamp: new Date().toISOString(),
        ...details,
    });
};
// Уведомление админа о критических ошибках
export const notifyAdminAboutError = async (error, context, userId, details) => {
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
    }
    catch (notifyError) {
        logger.error('Failed to notify admin about error', { notifyError });
    }
};
export const logAPICall = (service, endpoint, duration, success, details) => {
    logger.http(`API call to ${service}`, {
        service,
        endpoint,
        duration,
        success,
        ...details,
    });
};
// Метрики для мониторинга
class MetricsCollector {
    constructor() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalUsers: new Set(),
            totalPayments: 0,
            totalRevenue: 0,
            responseTimeSum: 0,
            responseTimeCount: 0,
        };
    }
    recordRequest(success, userId) {
        this.metrics.totalRequests++;
        if (success) {
            this.metrics.successfulRequests++;
        }
        else {
            this.metrics.failedRequests++;
        }
        if (userId) {
            this.metrics.totalUsers.add(userId);
        }
    }
    recordPayment(amount, userId) {
        this.metrics.totalPayments++;
        this.metrics.totalRevenue += amount;
        this.metrics.totalUsers.add(userId);
    }
    recordResponseTime(timeMs) {
        this.metrics.responseTimeSum += timeMs;
        this.metrics.responseTimeCount++;
    }
    getMetrics() {
        return {
            ...this.metrics,
            totalUniqueUsers: this.metrics.totalUsers.size,
            averageResponseTime: this.metrics.responseTimeCount > 0
                ? this.metrics.responseTimeSum / this.metrics.responseTimeCount
                : 0,
            successRate: this.metrics.totalRequests > 0
                ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
                : 0,
        };
    }
    reset() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalUsers: new Set(),
            totalPayments: 0,
            totalRevenue: 0,
            responseTimeSum: 0,
            responseTimeCount: 0,
        };
    }
}
export const metrics = new MetricsCollector();
// Периодическое логирование метрик
setInterval(() => {
    const currentMetrics = metrics.getMetrics();
    logger.info('📊 Metrics report', currentMetrics);
}, 30 * 60 * 1000); // Каждые 30 минут
// Мониторинг производительности
export class PerformanceMonitor {
    constructor() {
        this.timers = new Map();
    }
    start(label) {
        this.timers.set(label, Date.now());
    }
    end(label) {
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
    measure(label, fn) {
        return this.measureSync(label, fn);
    }
    async measureSync(label, fn) {
        this.start(label);
        try {
            const result = await fn();
            const duration = this.end(label);
            logger.debug(`${label} completed in ${duration}ms`);
            return result;
        }
        catch (error) {
            this.end(label);
            throw error;
        }
    }
}
export const performanceMonitor = new PerformanceMonitor();
//# sourceMappingURL=logger.js.map