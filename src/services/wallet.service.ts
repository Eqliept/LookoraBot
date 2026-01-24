import type { Language } from "../states/user.state.ts";

export interface TopUpPackage {
    amount: number;
    bonus: number;
    total: number;
    price: number;
}

/**
 * Рассчитать бонус для суммы пополнения
 */
export const calculateBonus = (amount: number): number => {
    if (amount >= 3000) return 0.60;
    if (amount >= 1000) return 0.30;
    if (amount >= 500) return 0.15;
    return 0;
};

/**
 * Получить информацию о пакете
 */
export const getPackageInfo = (amount: number): TopUpPackage => {
    const bonus = calculateBonus(amount);
    const bonusCoins = Math.floor(amount * bonus);
    const total = amount + bonusCoins;
    const price = amount / 100; // 100 койнов = 1$

    return {
        amount,
        bonus: bonus * 100,
        total,
        price
    };
};

/**
 * Пополнить баланс пользователя (мок)
 */
export const processTopUp = async (userId: number, amount: number): Promise<{ success: boolean; total: number }> => {
    const { total } = getPackageInfo(amount);
    
    // TODO: Реальная логика оплаты
    console.log(`[MOCK] User ${userId} topped up ${amount} coins, received ${total} with bonus`);
    
    return {
        success: true,
        total
    };
};
