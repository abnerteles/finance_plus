import React, { useMemo } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, EditIcon, TrashIcon } from './icons';

interface CashFlowViewProps {
    onEditTransaction: (transaction: Transaction) => void;
}

const CashFlowTransactionItem: React.FC<{ transaction: Transaction, onEdit: () => void, onDelete: () => void }> = ({ transaction, onEdit, onDelete }) => {
    const { accounts } = useFinancialData();
    const account = accounts.find(a => a.id === transaction.accountId);
    const isIncome = transaction.transactionType === TransactionType.INCOME;
    const isTransfer = transaction.transactionType === TransactionType.TRANSFER;
    const amountColor = isIncome ? 'text-green-500' : isTransfer ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="grid grid-cols-12 gap-4 items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <div className="col-span-4 flex items-center">
                <div className="flex-shrink-0">
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                </div>
            </div>
            <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300">{account?.name}</div>
            <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300">{transaction.paymentMethod}</div>
            <div className={`col-span-3 text-right font-semibold ${amountColor}`}>
                {isIncome ? '+' : isTransfer ? '' : '-'} {formatCurrency(transaction.amount)}
            </div>
            <div className="col-span-1 text-right">
                <div className="flex items-center justify-end space-x-2">
                    <button onClick={onEdit} className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const CashFlowView: React.FC<CashFlowViewProps> = ({ onEditTransaction }) => {
    const { transactions, totalBalance, deleteTransaction } = useFinancialData();

    const { transactionsByDay, dailyBalances } = useMemo(() => {
        const grouped: { [key: string]: Transaction[] } = {};
        transactions.forEach(t => {
            const dateKey = new Date(t.date).toISOString().split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(t);
        });

        const balances: { [key: string]: number } = {};
        const sortedDays = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        let runningBalance = totalBalance;

        for (const day of sortedDays) {
            balances[day] = runningBalance;
            const dayDelta = grouped[day].reduce((sum, t) => {
                if (t.transactionType === TransactionType.INCOME) return sum + t.amount;
                if (t.transactionType === TransactionType.EXPENSE) return sum - t.amount;
                return sum;
            }, 0);
            runningBalance -= dayDelta;
        }

        return { transactionsByDay: grouped, dailyBalances: balances, sortedDays };
    }, [transactions, totalBalance]);

    const sortedDays = Object.keys(transactionsByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fluxo de Caixa Diário</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <div className="col-span-4">Descrição</div>
                    <div className="col-span-2">Conta</div>
                    <div className="col-span-2">Método</div>
                    <div className="col-span-3 text-right">Valor</div>
                    <div className="col-span-1 text-right">Ações</div>
                </div>
                {sortedDays.map(dateKey => (
                    <div key={dateKey}>
                        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-2 sticky top-16 z-10">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{formatDate(dateKey)}</h3>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Saldo do dia:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(dailyBalances[dateKey] ?? 0)}</span>
                            </div>
                        </div>
                        {transactionsByDay[dateKey].map(t => (
                            <CashFlowTransactionItem 
                                key={t.id} 
                                transaction={t} 
                                onEdit={() => onEditTransaction(t)} 
                                onDelete={() => deleteTransaction(t.id)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CashFlowView;