import type { Language } from "../states/user.state.js";
import { prisma } from "./database.service.js";

export interface UserData {
    id: string;
    telegramId: string;
    language: string | null;
    coins: number;
    preCheckFails: number;
    createdAt: Date;
}

export const findUser = async (telegramId: number): Promise<UserData | null> => {
    return await prisma.user.findUnique({
        where: { telegramId: String(telegramId) }
    });
};

export const userExists = async (telegramId: number): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { telegramId: String(telegramId) }
    });
    return user !== null;
};

export const createUser = async (telegramId: number, language: Language): Promise<UserData> => {
    return await prisma.user.create({
        data: {
            telegramId: String(telegramId),
            language: language,
            coins: 50
        }
    });
};

export const updateUserLanguage = async (telegramId: number, language: Language): Promise<boolean> => {
    try {
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { language: language }
        });
        return true;
    } catch {
        return false;
    }
};

export const updateUserCoins = async (telegramId: number, coins: number): Promise<boolean> => {
    try {
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: coins }
        });
        return true;
    } catch {
        return false;
    }
};

export const addCoinsToUser = async (telegramId: number, amount: number): Promise<UserData | null> => {
    try {
        return await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: { increment: amount } }
        });
    } catch {
        return null;
    }
};

export const deductCoins = async (telegramId: number, amount: number): Promise<boolean> => {
    try {
        const user = await findUser(telegramId);
        if (!user || user.coins < amount) return false;
        
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: { decrement: amount } }
        });
        return true;
    } catch {
        return false;
    }
};


export const createPurchase = async (
    telegramId: number, 
    coins: number, 
    amountUsd: number
): Promise<boolean> => {
    try {
        const user = await findUser(telegramId);
        if (!user) return false;
        
        await prisma.purchase.create({
            data: {
                userId: user.id,
                coins: coins,
                amountUsd: amountUsd
            }
        });
        return true;
    } catch {
        return false;
    }
};

export const incrementPreCheckFails = async (telegramId: number): Promise<UserData | null> => {
    try {
        return await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { preCheckFails: { increment: 1 } }
        });
    } catch {
        return null;
    }
};

export const resetPreCheckFails = async (telegramId: number): Promise<boolean> => {
    try {
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { preCheckFails: 0 }
        });
        return true;
    } catch {
        return false;
    }
};

export const PRECHECK_PENALTY = 10;
export const PRECHECK_FREE_ATTEMPTS = 3;
