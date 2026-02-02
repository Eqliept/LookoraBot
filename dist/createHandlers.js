import { startHandler } from "./handlers/start.handler.js";
import { walletHandler } from "./handlers/wallet.handler.js";
import { appearanceHandler } from "./handlers/appearance.handler.js";
import { styleHandler } from "./handlers/style.handler.js";
import { hairHandler } from "./handlers/hair.handler.js";
import { adminHandler } from "./handlers/admin.handler.js";
import { channelHandler } from "./handlers/channel.handler.js";
export function createHandlers(bot) {
    startHandler(bot);
    appearanceHandler(bot);
    styleHandler(bot);
    hairHandler(bot);
    walletHandler(bot);
    adminHandler(bot);
    channelHandler(bot);
}
//# sourceMappingURL=createHandlers.js.map