// Стоимость услуг
export const APPEARANCE_COST = 50;
export const TIPS_COST = 25;

// Админ
export const ADMIN_ID = 1529335902;

// Пути к изображениям
const IMAGES_DIR = new URL("../images/", import.meta.url).pathname.slice(1);
export const FRONT_PHOTO_EXAMPLE = `${IMAGES_DIR}front_photo.png`;
export const SIDE_PHOTO_EXAMPLE = `${IMAGES_DIR}side_photo.png`;
export const MAIN_IMAGE = `${IMAGES_DIR}main.png`;
export const WALLET_IMAGE = `${IMAGES_DIR}wallet.png`;
export const HELP_IMAGE = `${IMAGES_DIR}help.png`;
