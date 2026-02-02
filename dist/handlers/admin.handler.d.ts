import { Bot } from "grammy";
import type { MyContext } from "../middleware/autoLanguage.middleware.js";
export declare const adminHandler: (bot: Bot<MyContext>) => void;
export declare function notifyAdminAboutPurchase(bot: Bot<MyContext>, userId: number, amount: number, price: number, method: string): Promise<void>;
//# sourceMappingURL=admin.handler.d.ts.map