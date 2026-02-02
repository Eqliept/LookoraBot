import { Bot } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
/**
 * Получить приветственное сообщение
 */
export declare function getWelcomeMessage(ctx: MyContext): Promise<string>;
/**
 * Получить сообщение "с возвращением"
 */
export declare function getWelcomeBackMessage(ctx: MyContext): Promise<string>;
export declare const startHandler: (bot: Bot<MyContext>) => void;
//# sourceMappingURL=start.handler.d.ts.map