import "dotenv/config";

const CRYPTO_BOT_API = "https://pay.crypt.bot/api";
const CRYPTO_BOT_TOKEN = process.env.CRIPTO_BOT_TOKEN!;

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

export const createCryptoBotInvoice = async (params: CreateInvoiceParams): Promise<CryptoBotInvoice | null> => {
    try {
        const response = await fetch(`${CRYPTO_BOT_API}/createInvoice`, {
            method: "POST",
            headers: {
                "Crypto-Pay-API-Token": CRYPTO_BOT_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                asset: params.asset || "USDT",
                amount: params.amount.toString(),
                description: params.description || "Пополнение баланса",
                payload: params.payload || "",
                expires_in: params.expires_in || 3600
            })
        });

        const data = await response.json();
        
        if (data.ok) {
            return data.result as CryptoBotInvoice;
        } else {
            console.error("CryptoBot API error:", data.error);
            return null;
        }
    } catch (error) {
        console.error("CryptoBot request error:", error);
        return null;
    }
};

export const checkInvoiceStatus = async (invoiceId: number): Promise<string | null> => {
    try {
        const response = await fetch(`${CRYPTO_BOT_API}/getInvoices`, {
            method: "POST",
            headers: {
                "Crypto-Pay-API-Token": CRYPTO_BOT_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                invoice_ids: [invoiceId]
            })
        });

        const data = await response.json();
        
        if (data.ok && data.result.items.length > 0) {
            return data.result.items[0].status;
        }
        return null;
    } catch (error) {
        console.error("CryptoBot check error:", error);
        return null;
    }
};

export const getCurrencies = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${CRYPTO_BOT_API}/getCurrencies`, {
            method: "GET",
            headers: {
                "Crypto-Pay-API-Token": CRYPTO_BOT_TOKEN
            }
        });

        const data = await response.json();
        
        if (data.ok) {
            return data.result.map((c: any) => c.code);
        }
        return ["USDT", "TON", "BTC"];
    } catch (error) {
        return ["USDT", "TON", "BTC"];
    }
};
