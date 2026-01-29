import type { Bot } from "grammy";
import { startHandler } from "./handlers/start.handler.ts";
import { walletHandler } from "./handlers/wallet.handler.ts";
import { appearanceHandler } from "./handlers/appearance.handler.ts";
import { styleHandler } from "./handlers/style.handler.ts";
import { adminHandler } from "./handlers/admin.handler.ts";
import type { MyContext } from "./middleware/autoLanguage.middleware.ts";

export function createHandlers(bot: Bot<MyContext>) {
    startHandler(bot);
    appearanceHandler(bot);
    styleHandler(bot);
    walletHandler(bot);
    adminHandler(bot);
}