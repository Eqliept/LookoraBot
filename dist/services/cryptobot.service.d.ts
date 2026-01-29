import "dotenv/config";
export interface CryptoBotInvoice {
    invoice_id: number;
    bot_invoice_url: string;
    mini_app_invoice_url: string;
    web_app_invoice_url: string;
    status: string;
    hash: string;
    amount: string;
    asset: string;
}
interface CreateInvoiceParams {
    amount: number;
    asset?: string;
    description?: string;
    payload?: string;
    expires_in?: number;
}
export declare const createCryptoBotInvoice: (params: CreateInvoiceParams) => Promise<CryptoBotInvoice | null>;
export declare const checkInvoiceStatus: (invoiceId: number) => Promise<string | null>;
export declare const getCurrencies: () => Promise<string[]>;
export {};
//# sourceMappingURL=cryptobot.service.d.ts.map