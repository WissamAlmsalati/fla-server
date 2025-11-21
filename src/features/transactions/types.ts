export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type Currency = 'USD' | 'LYD' | 'CNY';

export interface Transaction {
    id: number;
    customerId: number;
    type: TransactionType;
    amount: number;
    currency: Currency;
    balanceBefore: number;
    balanceAfter: number;
    notes?: string;
    createdBy?: number;
    createdAt: string;
}

export interface CreateTransactionInput {
    customerId: number;
    type: TransactionType;
    amount: number;
    currency: Currency;
    notes?: string;
}

export interface TransactionFilters {
    customerId: number;
    currency?: Currency;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
}

export interface TransactionStats {
    totalDeposits: Record<Currency, number>;
    totalWithdrawals: Record<Currency, number>;
    netChange: Record<Currency, number>;
    transactionCount: number;
}
