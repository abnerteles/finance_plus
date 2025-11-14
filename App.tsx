import React, { useState } from 'react';
import { FinancialDataProvider } from './context/FinancialDataContext';
import Dashboard from './components/Dashboard';
import CashFlowView from './components/CashFlowView';
import Investments from './components/Investments';
import { Header } from './components/Header';
import { PlusIcon } from './components/icons';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AddInvestmentModal } from './components/AddInvestmentModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { EditInvestmentModal } from './components/EditInvestmentModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import type { ModalType, Transaction, AnyInvestment } from './types';

type ActiveView = 'dashboard' | 'cashflow' | 'investments';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [investmentToEdit, setInvestmentToEdit] = useState<AnyInvestment | null>(null);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    const handleEditTransaction = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
    };

    const handleEditInvestment = (investment: AnyInvestment) => {
        setInvestmentToEdit(investment);
    };

    return (
        <FinancialDataProvider>
            <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
                <Header 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    onOpenCategoryManager={() => setCategoryModalOpen(true)}
                />

                <main className="p-4 sm:p-6 lg:p-8">
                    {activeView === 'dashboard' && <Dashboard />}
                    {activeView === 'cashflow' && <CashFlowView onEditTransaction={handleEditTransaction} />}
                    {activeView === 'investments' && <Investments onEditInvestment={handleEditInvestment} />}
                </main>

                {/* Floating Action Buttons */}
                <div className="fixed top-20 right-6 z-50 flex flex-col items-end space-y-4">
                    {/* Add Transaction Button */}
                    <div className="relative group">
                        <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 hidden group-hover:block w-max bg-gray-700 dark:bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            Adicionar Lançamento
                        </div>
                        <button
                            onClick={() => setActiveModal('transaction')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
                            aria-label="Adicionar novo lançamento"
                        >
                            <PlusIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Add Investment Button */}
                    {activeView === 'investments' && (
                        <div className="relative group">
                            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 hidden group-hover:block w-max bg-gray-700 dark:bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                Adicionar Investimento
                            </div>
                            <button
                                onClick={() => setActiveModal('investment')}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
                                aria-label="Adicionar novo investimento"
                            >
                                <PlusIcon className="h-6 w-6" />
                            </button>
                        </div>
                    )}
                </div>

                <AddTransactionModal
                    isOpen={activeModal === 'transaction'}
                    onClose={() => setActiveModal(null)}
                    onAddAccount={() => setActiveModal('account')}
                />
                <AddAccountModal
                    isOpen={activeModal === 'account'}
                    onClose={() => setActiveModal(null)}
                />
                <AddInvestmentModal
                    isOpen={activeModal === 'investment'}
                    onClose={() => setActiveModal(null)}
                />
                {transactionToEdit && (
                    <EditTransactionModal
                        isOpen={!!transactionToEdit}
                        onClose={() => setTransactionToEdit(null)}
                        transaction={transactionToEdit}
                    />
                )}
                 {investmentToEdit && (
                    <EditInvestmentModal
                        isOpen={!!investmentToEdit}
                        onClose={() => setInvestmentToEdit(null)}
                        investment={investmentToEdit}
                    />
                )}
                <CategoryManagerModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                />
            </div>
        </FinancialDataProvider>
    );
};

export default App;