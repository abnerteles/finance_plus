import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { Modal } from './shared/Modal';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
}

const paymentMethodSuggestions = ['PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Dinheiro', 'Transferência Bancária', 'Débito Automático'];

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction }) => {
    const { accounts, updateTransaction, categories } = useFinancialData();
    const [transactionType, setTransactionType] = useState<TransactionType>(transaction.transactionType);
    const [accountId, setAccountId] = useState<string>(transaction.accountId);
    const [toAccountId, setToAccountId] = useState<string>(transaction.toAccountId || '');
    const [amount, setAmount] = useState<string>(String(transaction.amount));
    const [description, setDescription] = useState<string>(transaction.description);
    const [category, setCategory] = useState<string>(transaction.category);
    const [paymentMethod, setPaymentMethod] = useState<string>(transaction.paymentMethod);
    const [date, setDate] = useState<string>(new Date(transaction.date).toISOString().split('T')[0]);

    const availableCategories = categories.filter(c => c.type === transactionType || transactionType === TransactionType.TRANSFER);

    useEffect(() => {
        setTransactionType(transaction.transactionType);
        setAccountId(transaction.accountId);
        setToAccountId(transaction.toAccountId || '');
        setAmount(String(transaction.amount));
        setDescription(transaction.description);
        setCategory(transaction.category);
        setPaymentMethod(transaction.paymentMethod);
        setDate(new Date(transaction.date).toISOString().split('T')[0]);
    }, [transaction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: Partial<Transaction> = {
            accountId,
            transactionType,
            amount: parseFloat(amount),
            description,
            category,
            paymentMethod,
            date: new Date(date).toISOString(),
            ...(transactionType === TransactionType.TRANSFER && { toAccountId })
        };
        updateTransaction(transaction.id, updatedData);
        onClose();
    };

    const inputClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Lançamento">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    {Object.values(TransactionType).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTransactionType(t)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${transactionType === t ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Valor</label>
                        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label className={labelClasses}>Data</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} required />
                    </div>
                </div>
                 <div>
                    <label className={labelClasses}>Descrição</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClasses} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className={labelClasses}>Categoria</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses} disabled={transactionType === TransactionType.TRANSFER}>
                           {transactionType === TransactionType.TRANSFER 
                                ? <option>Transferência</option>
                                : availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className={labelClasses}>Método de Pagamento</label>
                        <input list="payment-methods" type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClasses} required />
                        <datalist id="payment-methods">
                            {paymentMethodSuggestions.map(p => <option key={p} value={p} />)}
                        </datalist>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Conta {transactionType === TransactionType.TRANSFER ? 'de Origem' : ''}</label>
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClasses}>
                       {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>

                {transactionType === TransactionType.TRANSFER && (
                    <div>
                        <label className={labelClasses}>Conta de Destino</label>
                        <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className={inputClasses} required>
                             <option value="">Selecione...</option>
                           {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                )}
                
                <div className="flex justify-end pt-2">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Alterações</button>
                </div>
            </form>
        </Modal>
    );
};