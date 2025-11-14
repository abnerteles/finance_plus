import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import type { BankAccount, Transaction, Investment, Category, FixedIncomeInvestment } from '../types';
import { TransactionType, AssetType } from '../types';
import { getMarketData, subscribeToMarketUpdates } from '../services/marketDataService';
import type { MarketData } from '../services/marketDataService';


// --- STATE & REDUCER ---

interface FinancialState {
    accounts: BankAccount[];
    transactions: Transaction[];
    investments: Investment[];
    fixedIncomeInvestments: FixedIncomeInvestment[];
    categories: Category[];
    marketData: MarketData;
}

type Action =
  | { type: 'SET_MARKET_DATA'; payload: MarketData | ((prev: MarketData) => MarketData) }
  | { type: 'ADD_ACCOUNT'; payload: Omit<BankAccount, 'id'> }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_INVESTMENT'; payload: Omit<Investment, 'id'> }
  | { type: 'UPDATE_INVESTMENT'; payload: { id: string; updates: Partial<Investment> } }
  | { type: 'DELETE_INVESTMENT'; payload: string }
  | { type: 'ADD_FIXED_INCOME'; payload: Omit<FixedIncomeInvestment, 'id'> }
  | { type: 'UPDATE_FIXED_INCOME'; payload: { id: string; updates: Partial<FixedIncomeInvestment> } }
  | { type: 'DELETE_FIXED_INCOME'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string };

const initialState: FinancialState = {
    accounts: [
        { id: '1', name: 'Itaú Corrente', bank: 'Itaú', initialBalance: 5000 },
        { id: '2', name: 'Nubank NuConta', bank: 'Nubank', initialBalance: 1500 },
    ],
    categories: [
        { id: 'cat1', name: 'Salário', type: 'Entrada' },
        { id: 'cat2', name: 'Freelance', type: 'Entrada' },
        { id: 'cat3', name: 'Moradia', type: 'Saída' },
        { id: 'cat4', name: 'Alimentação', type: 'Saída' },
        { id: 'cat5', name: 'Transporte', type: 'Saída' },
        { id: 'cat6', name: 'Lazer', type: 'Saída' },
    ],
    transactions: [
        { id: 't1', date: new Date(new Date().setDate(1)).toISOString(), accountId: '1', transactionType: TransactionType.INCOME, category: 'Salário', description: 'Salário Mensal', amount: 7500, paymentMethod: 'Transferência Bancária' },
        { id: 't2', date: new Date(new Date().setDate(2)).toISOString(), accountId: '1', transactionType: TransactionType.EXPENSE, category: 'Moradia', description: 'Aluguel', amount: 2000, paymentMethod: 'Débito Automático' },
        { id: 't3', date: new Date(new Date().setDate(5)).toISOString(), accountId: '2', transactionType: TransactionType.EXPENSE, category: 'Alimentação', description: 'Supermercado', amount: 600, paymentMethod: 'Cartão de Débito' },
        { id: 't4', date: new Date(new Date().setDate(10)).toISOString(), accountId: '1', transactionType: TransactionType.TRANSFER, category: 'Transferência', description: 'Transf. para Nubank', amount: 1000, toAccountId: '2', paymentMethod: 'PIX' },
        { id: 't5', date: new Date(new Date().setDate(12)).toISOString(), accountId: '2', transactionType: TransactionType.INCOME, category: 'Freelance', description: 'Projeto X', amount: 800, paymentMethod: 'PIX' },
    ],
    investments: [
        { id: 'i1', type: AssetType.STOCK, ticker: 'PETR4', quantity: 100, purchasePrice: 30.50, purchaseDate: new Date('2023-05-10').toISOString() },
        { id: 'i2', type: AssetType.INTERNATIONAL_STOCK, ticker: 'AAPL', quantity: 10, purchasePrice: 150.00, purchaseDate: new Date('2023-01-15').toISOString() },
        { id: 'i3', type: AssetType.CRYPTO, ticker: 'BTC', quantity: 0.05, purchasePrice: 45000.00, purchaseDate: new Date('2023-08-20').toISOString() },
        { id: 'i4', type: AssetType.REAL_ESTATE_FUND, ticker: 'MXRF11', quantity: 200, purchasePrice: 10.50, purchaseDate: new Date('2023-03-22').toISOString() },
        { id: 'i5', type: AssetType.INTERNATIONAL_STOCK, ticker: 'GOOGL', quantity: 5, purchasePrice: 130.00, purchaseDate: new Date('2023-09-01').toISOString() },
        { id: 'i6', type: AssetType.REIT, ticker: 'O', quantity: 50, purchasePrice: 60.00, purchaseDate: new Date('2023-02-10').toISOString() },
    ],
    fixedIncomeInvestments: [
        { id: 'fi1', type: AssetType.FIXED_INCOME, name: 'CDB Liquidez Diária', issuer: 'Banco Inter', amountInvested: 10000, yieldRate: '100% CDI', purchaseDate: new Date('2023-10-01').toISOString(), maturityDate: new Date('2025-10-01').toISOString() },
        { id: 'fi2', type: AssetType.FIXED_INCOME, name: 'Tesouro IPCA+ 2029', issuer: 'Tesouro Nacional', amountInvested: 5000, yieldRate: 'IPCA + 5.8%', purchaseDate: new Date('2023-11-15').toISOString(), maturityDate: new Date('2029-05-15').toISOString() },
    ],
    marketData: {},
};

const financialReducer = (state: FinancialState, action: Action): FinancialState => {
    switch (action.type) {
        case 'SET_MARKET_DATA':
            if (typeof action.payload === 'function') {
                return { ...state, marketData: action.payload(state.marketData) };
            }
            return { ...state, marketData: action.payload };
        
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...state.accounts, { ...action.payload, id: new Date().toISOString() }] };

        case 'ADD_TRANSACTION':
            return { ...state, transactions: [...state.transactions, { ...action.payload, id: new Date().toISOString() }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
        case 'UPDATE_TRANSACTION':
            return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
        case 'DELETE_TRANSACTION':
            return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };

        case 'ADD_INVESTMENT':
            return { ...state, investments: [...state.investments, { ...action.payload, id: new Date().toISOString() }] };
        case 'UPDATE_INVESTMENT':
            return { ...state, investments: state.investments.map(inv => (inv.id === action.payload.id ? { ...inv, ...action.payload.updates } : inv)) };
        case 'DELETE_INVESTMENT':
            return { ...state, investments: state.investments.filter(inv => inv.id !== action.payload) };
            
        case 'ADD_FIXED_INCOME':
            return { ...state, fixedIncomeInvestments: [...state.fixedIncomeInvestments, { ...action.payload, id: new Date().toISOString() }] };
        case 'UPDATE_FIXED_INCOME':
            return { ...state, fixedIncomeInvestments: state.fixedIncomeInvestments.map(inv => (inv.id === action.payload.id ? { ...inv, ...action.payload.updates } : inv)) };
        case 'DELETE_FIXED_INCOME':
            return { ...state, fixedIncomeInvestments: state.fixedIncomeInvestments.filter(inv => inv.id !== action.payload) };

        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, { ...action.payload, id: new Date().toISOString() }] };
        case 'UPDATE_CATEGORY':
            return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? { ...c, ...action.payload.updates } : c) };
        case 'DELETE_CATEGORY':
            return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };

        default:
            return state;
    }
};


// --- CONTEXT ---
interface FinancialDataContextType {
    accounts: BankAccount[];
    transactions: Transaction[];
    investments: Investment[];
    fixedIncomeInvestments: FixedIncomeInvestment[];
    categories: Category[];
    marketData: MarketData;
    addAccount: (account: Omit<BankAccount, 'id'>) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addInvestment: (investment: Omit<Investment, 'id'>) => void;
    updateInvestment: (id: string, updates: Partial<Investment>) => void;
    deleteInvestment: (id: string) => void;
    addFixedIncomeInvestment: (investment: Omit<FixedIncomeInvestment, 'id'>) => void;
    updateFixedIncomeInvestment: (id: string, updates: Partial<FixedIncomeInvestment>) => void;
    deleteFixedIncomeInvestment: (id: string) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    totalBalance: number;
    accountBalances: Record<string, number>;
    totalInvested: number;
    portfolioValue: number;
    portfolioPL: number;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(financialReducer, initialState);

    useEffect(() => {
        const fetchInitialData = async () => {
            const tickers = state.investments.map(inv => inv.ticker);
            const data = await getMarketData(tickers);
            dispatch({ type: 'SET_MARKET_DATA', payload: data });
        };
        fetchInitialData();

        const unsubscribe = subscribeToMarketUpdates(state.investments.map(inv => inv.ticker), (data) => dispatch({ type: 'SET_MARKET_DATA', payload: data }));
        return () => unsubscribe();
    }, [state.investments]);
    
    // --- ACTIONS ---
    const addAccount = (account: Omit<BankAccount, 'id'>) => dispatch({ type: 'ADD_ACCOUNT', payload: account });
    const addTransaction = (transaction: Omit<Transaction, 'id'>) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    const updateTransaction = (id: string, updates: Partial<Transaction>) => dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
    const deleteTransaction = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este lançamento?')) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        }
    };

    const addInvestment = (investment: Omit<Investment, 'id'>) => dispatch({ type: 'ADD_INVESTMENT', payload: investment });
    const updateInvestment = (id: string, updates: Partial<Investment>) => dispatch({ type: 'UPDATE_INVESTMENT', payload: { id, updates } });
    const deleteInvestment = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este investimento?')) {
            dispatch({ type: 'DELETE_INVESTMENT', payload: id });
        }
    };
    
    const addFixedIncomeInvestment = (investment: Omit<FixedIncomeInvestment, 'id'>) => dispatch({ type: 'ADD_FIXED_INCOME', payload: investment });
    const updateFixedIncomeInvestment = (id: string, updates: Partial<FixedIncomeInvestment>) => dispatch({ type: 'UPDATE_FIXED_INCOME', payload: { id, updates } });
    const deleteFixedIncomeInvestment = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este investimento?')) {
            dispatch({ type: 'DELETE_FIXED_INCOME', payload: id });
        }
    };

    const addCategory = (category: Omit<Category, 'id'>) => dispatch({ type: 'ADD_CATEGORY', payload: category });
    const updateCategory = (id: string, updates: Partial<Category>) => dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
    const deleteCategory = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta categoria?')) {
            dispatch({ type: 'DELETE_CATEGORY', payload: id });
        }
    };

    // --- MEMOIZED CALCULATIONS ---
    const accountBalances = useMemo(() => {
        const balances: Record<string, number> = {};
        state.accounts.forEach(acc => {
            balances[acc.id] = acc.initialBalance;
        });

        [...state.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
            if (balances[t.accountId] !== undefined) {
                if (t.transactionType === TransactionType.INCOME) balances[t.accountId] += t.amount;
                else if (t.transactionType === TransactionType.EXPENSE) balances[t.accountId] -= t.amount;
                else if (t.transactionType === TransactionType.TRANSFER) {
                    balances[t.accountId] -= t.amount;
                    if (t.toAccountId && balances[t.toAccountId] !== undefined) {
                        balances[t.toAccountId] += t.amount;
                    }
                }
            }
        });
        return balances;
    }, [state.accounts, state.transactions]);

    const totalBalance = useMemo(() => Object.values(accountBalances).reduce((sum, balance) => sum + balance, 0), [accountBalances]);

    const accountsWithCurrentBalance = useMemo(() => state.accounts.map(acc => ({
        ...acc,
        balance: accountBalances[acc.id] ?? acc.initialBalance
    })), [state.accounts, accountBalances]);

    const { totalInvested, portfolioValue } = useMemo(() => {
        let totalVarInvested = state.investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
        let portfolioVarValue = state.investments.reduce((sum, inv) => {
            const currentPrice = state.marketData[inv.ticker]?.price ?? inv.purchasePrice;
            return sum + (currentPrice * inv.quantity);
        }, 0);
        const totalFixedInvested = state.fixedIncomeInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
        return { 
            totalInvested: totalVarInvested + totalFixedInvested, 
            portfolioValue: portfolioVarValue + totalFixedInvested
        };
    }, [state.investments, state.fixedIncomeInvestments, state.marketData]);
    
    const portfolioPL = portfolioValue - totalInvested;

    // --- CONTEXT VALUE ---
    const value = {
        ...state,
        accounts: accountsWithCurrentBalance,
        addAccount, addTransaction, updateTransaction, deleteTransaction,
        addInvestment, updateInvestment, deleteInvestment,
        addFixedIncomeInvestment, updateFixedIncomeInvestment, deleteFixedIncomeInvestment,
        addCategory, updateCategory, deleteCategory,
        totalBalance, accountBalances, totalInvested, portfolioValue, portfolioPL
    };

    return (
        <FinancialDataContext.Provider value={value}>
            {children}
        </FinancialDataContext.Provider>
    );
};

export const useFinancialData = () => {
    const context = useContext(FinancialDataContext);
    if (context === undefined) {
        throw new Error('useFinancialData must be used within a FinancialDataProvider');
    }
    return context;
};
