export interface BankAccount {
    id: string;
    name: string;
    bank: string;
    initialBalance: number;
    balance?: number; // Calculated dynamically
}

export enum TransactionType {
    INCOME = 'Entrada',
    EXPENSE = 'Saída',
    TRANSFER = 'Transferência',
}

export interface Transaction {
    id: string;
    date: string; // ISO string format
    accountId: string;
    transactionType: TransactionType;
    category: string;
    description: string;
    amount: number;
    paymentMethod: string;
    // For transfers
    toAccountId?: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'Entrada' | 'Saída';
}

export enum AssetType {
    FIXED_INCOME = 'Renda Fixa',
    STOCK = 'Ação',
    REAL_ESTATE_FUND = 'Fundo Imobiliário',
    CRYPTO = 'Criptomoeda',
    INTERNATIONAL_STOCK = 'Ação Internacional',
    REIT = 'REIT',
}

// For variable income assets
export interface Investment {
    id: string;
    type: Exclude<AssetType, AssetType.FIXED_INCOME>;
    ticker: string; // e.g., PETR4, AAPL, BTC
    quantity: number;
    purchasePrice: number;
    purchaseDate: string; // ISO string format
}

// For fixed income assets
export interface FixedIncomeInvestment {
    id: string;
    type: AssetType.FIXED_INCOME;
    name: string; // e.g., CDB Liquidez Diária
    issuer: string; // e.g., Banco Inter
    amountInvested: number;
    yieldRate: string; // e.g., "110% CDI" or "IPCA + 5.5%"
    purchaseDate: string;
    maturityDate: string;
}

export type AnyInvestment = Investment | FixedIncomeInvestment;

export type ModalType = 'transaction' | 'account' | 'investment' | null;