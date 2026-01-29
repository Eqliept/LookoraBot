import type { Bot } from "grammy";
import { userIdGuard } from "./guards/user-id.guard.js";
import type { MyContext } from "./middleware/autoLanguage.middleware.js";

export function createGuards(bot: Bot<MyContext>) {
    userIdGuard(bot);
}