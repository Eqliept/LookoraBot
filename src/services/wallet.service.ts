import type { Language } from "../states/user.state.js";

export interface TopUpPackage {
    amount: number;
    bonus: number;
    total: number;
    price: number;
}

export const calculateBonus = (amount: number): number => {
    if (amount >= 3000) return 0.60;
    if (amount >= 1000) return 0.30;
    if (amount >= 500) return 0.15;
    return 0;
};

export const getPackageInfo = (amount: number): TopUpPackage => {
    const bonus = calculateBonus(amount);
    const bonusCoins = Math.floor(amount * bonus);
    const total = amount + bonusCoins;
    const price = amount / 100;

    return {
        amount,
        bonus: bonus * 100,
        total,
        price
    };
};

export const processTopUp = async (userId: number, amount: number): Promise<{ success: boolean; total: number }> => {
    const { total } = getPackageInfo(amount);

    return {
        success: true,
        total
    };
};
