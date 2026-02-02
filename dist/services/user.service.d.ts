import type { Language } from "../states/user.state.js";
export interface UserData {
    id: string;
    telegramId: string;
    language: string | null;
    coins: number;
    preCheckFails: number;
    channelBonusClaimed: boolean;
    createdAt: Date;
}
export declare const findUser: (telegramId: number) => Promise<UserData | null>;
export declare const userExists: (telegramId: number) => Promise<boolean>;
export declare const createUser: (telegramId: number, language: Language) => Promise<UserData>;
export declare const updateUserLanguage: (telegramId: number, language: Language) => Promise<boolean>;
export declare const updateUserCoins: (telegramId: number, coins: number) => Promise<boolean>;
export declare const addCoinsToUser: (telegramId: number, amount: number) => Promise<UserData | null>;
export declare const deductCoins: (telegramId: number, amount: number) => Promise<boolean>;
export declare const removeCoinsFromUser: (telegramId: number, amount: number) => Promise<UserData | null>;
export declare const claimChannelBonus: (telegramId: number, bonusAmount: number) => Promise<UserData | null>;
export declare const createPurchase: (telegramId: number, coins: number, amountUsd: number) => Promise<boolean>;
export declare const incrementPreCheckFails: (telegramId: number) => Promise<UserData | null>;
export declare const resetPreCheckFails: (telegramId: number) => Promise<boolean>;
export declare const PRECHECK_PENALTY = 10;
export declare const PRECHECK_FREE_ATTEMPTS = 3;
//# sourceMappingURL=user.service.d.ts.map