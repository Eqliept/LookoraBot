import type { Bot } from "grammy";
import { userIdGuard } from "./guards/user-id.guard.ts";
import type { MyContext } from "./middleware/autoLanguage.middleware.ts";

export function createGuards(bot: Bot<MyContext>) {
    userIdGuard(bot);
}