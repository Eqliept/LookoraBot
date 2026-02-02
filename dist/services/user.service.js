import { prisma } from "./database.service.js";
export const findUser = async (telegramId) => {
    return await prisma.user.findUnique({
        where: { telegramId: String(telegramId) }
    });
};
export const userExists = async (telegramId) => {
    const user = await prisma.user.findUnique({
        where: { telegramId: String(telegramId) }
    });
    return user !== null;
};
export const createUser = async (telegramId, language) => {
    return await prisma.user.create({
        data: {
            telegramId: String(telegramId),
            language: language,
            coins: 100,
            channelBonusClaimed: true
        }
    });
};
export const updateUserLanguage = async (telegramId, language) => {
    try {
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { language: language }
        });
        return true;
    }
    catch {
        return false;
    }
};
export const updateUserCoins = async (telegramId, coins) => {
    try {
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: coins }
        });
        return true;
    }
    catch {
        return false;
    }
};
export const addCoinsToUser = async (telegramId, amount) => {
    try {
        return await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: { increment: amount } }
        });
    }
    catch {
        return null;
    }
};
export const deductCoins = async (telegramId, amount) => {
    try {
        const user = await findUser(telegramId);
        if (!user || user.coins < amount)
            return false;
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: { decrement: amount } }
        });
        return true;
    }
    catch {
        return false;
    }
};
export const removeCoinsFromUser = async (telegramId, amount) => {
    try {
        const user = await findUser(telegramId);
        if (!user || user.coins < amount)
            return null;
        return await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { coins: { decrement: amount } }
        });
    }
    catch {
        return null;
    }
};
export const claimChannelBonus = async (telegramId, bonusAmount) => {
    try {
        const user = await findUser(telegramId);
        if (!user || user.channelBonusClaimed)
            return null;
        return await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: {
                coins: { increment: bonusAmount },
                channelBonusClaimed: true
            }
        });
    }
    catch {
        return null;
    }
};
export const createPurchase = async (telegramId, coins, amountUsd) => {
    try {
        const user = await findUser(telegramId);
        if (!user)
            return false;
        await prisma.purchase.create({
            data: {
                userId: user.id,
                coins: coins,
                amountUsd: amountUsd
            }
        });
        return true;
    }
    catch {
        return false;
    }
};
export const incrementPreCheckFails = async (telegramId) => {
    try {
        return await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { preCheckFails: { increment: 1 } }
        });
    }
    catch {
        return null;
    }
};
export const resetPreCheckFails = async (telegramId) => {
    try {
        await prisma.user.update({
            where: { telegramId: String(telegramId) },
            data: { preCheckFails: 0 }
        });
        return true;
    }
    catch {
        return false;
    }
};
export const PRECHECK_PENALTY = 10;
export const PRECHECK_FREE_ATTEMPTS = 3;
//# sourceMappingURL=user.service.js.map