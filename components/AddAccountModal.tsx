

import React, { useState } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { Modal } from './shared/Modal';
import type { BankAccount } from '../types';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
    const { addAccount } = useFinancialData();
    const [name, setName] = useState('');
    const [bank, setBank] = useState('');
    const [initialBalance, setInitialBalance] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: Omit<BankAccount, 'id'> = {
            name,
            bank,
            initialBalance: parseFloat(initialBalance),
        };
        addAccount(newAccount);
        onClose();
        // Reset form
        setName('');
        setBank('');
        setInitialBalance('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Conta Bancária">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Conta</label>
                    <input type="text" placeholder="Ex: Conta Corrente" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</label>
                    <input type="text" placeholder="Ex: Itaú" value={bank} onChange={(e) => setBank(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saldo Inicial</label>
                    <input type="number" step="0.01" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div className="flex justify-end pt-2">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Adicionar Conta</button>
                </div>
            </form>
        </Modal>
    );
};