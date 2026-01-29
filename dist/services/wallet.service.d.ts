export interface TopUpPackage {
    amount: number;
    bonus: number;
    total: number;
    price: number;
}
/**
 * Рассчитать бонус для суммы пополнения
 */
export declare const calculateBonus: (amount: number) => number;
/**
 * Получить информацию о пакете
 */
export declare const getPackageInfo: (amount: number) => TopUpPackage;
/**
 * Пополнить баланс пользователя (мок)
 */
export declare const processTopUp: (userId: number, amount: number) => Promise<{
    success: boolean;
    total: number;
}>;
//# sourceMappingURL=wallet.service.d.ts.map