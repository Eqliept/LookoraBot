import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
export const APPEARANCE_COST = 50;
export const TIPS_COST = 25;
export const STYLE_COST = 100;
export const ADMIN_ID = 1529335902;
// Канал для получения бонуса
export const CHANNEL_ID = -1003725350365;
export const CHANNEL_URL = "https://t.me/lookorab";
export const CHANNEL_BONUS = 50;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IMAGES_DIR = join(__dirname, "..", "images");
export const FRONT_PHOTO_EXAMPLE = join(IMAGES_DIR, "front_photo.png");
export const SIDE_PHOTO_EXAMPLE = join(IMAGES_DIR, "side_photo.png");
export const FULL_BODY_PHOTO_EXAMPLE = join(IMAGES_DIR, "full_body_photo.png");
export const MAIN_IMAGE = join(IMAGES_DIR, "main.png");
export const WALLET_IMAGE = join(IMAGES_DIR, "wallet.png");
export const HELP_IMAGE = join(IMAGES_DIR, "help.png");
//# sourceMappingURL=index.js.map