

import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { AssetType } from '../types';
import type { Investment, FixedIncomeInvestment } from '../types';
import { Modal } from './shared/Modal';

interface AddInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose }) => {
    const { addInvestment, addFixedIncomeInvestment } = useFinancialData();
    const [type, setType] = useState<AssetType>(AssetType.STOCK);
    
    // Variable Asset State
    const [ticker, setTicker] = useState('');
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    
    // Fixed Income State
    const [name, setName] = useState('');
    const [issuer, setIssuer] = useState('');
    const [amountInvested, setAmountInvested] = useState('');
    const [yieldRate, setYieldRate] = useState('');
    const [maturityDate, setMaturityDate] = useState('');

    // Common State
    const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const resetForm = () => {
        setType(AssetType.STOCK);
        setTicker('');
        setQuantity('');
        setPurchasePrice('');
        setName('');
        setIssuer('');
        setAmountInvested('');
        setYieldRate('');
        setMaturityDate('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (type === AssetType.FIXED_INCOME) {
            const newInvestment: Omit<FixedIncomeInvestment, 'id'> = {
                type,
                name,
                issuer,
                amountInvested: parseFloat(amountInvested),
                yieldRate,
                purchaseDate: new Date(purchaseDate).toISOString(),
                maturityDate: new Date(maturityDate).toISOString(),
            };
            addFixedIncomeInvestment(newInvestment);
        } else {
            const newInvestment: Omit<Investment, 'id'> = {
                type: type as Exclude<AssetType, AssetType.FIXED_INCOME>,
                ticker: ticker.toUpperCase(),
                quantity: parseFloat(quantity),
                purchasePrice: parseFloat(purchasePrice),
                purchaseDate: new Date(purchaseDate).toISOString(),
            };
            addInvestment(newInvestment);
        }
        onClose();
    };
    
    useEffect(() => {
        if (!isOpen) {
           resetForm();
        }
    }, [isOpen]);

    const inputClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Investimento">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className={labelClasses}>Tipo de Ativo</label>
                    <select value={type} onChange={(e) => setType(e.target.value as AssetType)} className={inputClasses}>
                        {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {type === AssetType.FIXED_INCOME ? (
                    <>
                        <div>
                            <label className={labelClasses}>Nome do Ativo</label>
                            <input type="text" placeholder="Ex: CDB Liquidez Diária" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                        </div>
                         <div>
                            <label className={labelClasses}>Emissor</label>
                            <input type="text" placeholder="Ex: Banco Inter" value={issuer} onChange={(e) => setIssuer(e.target.value)} className={inputClasses} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className={labelClasses}>Valor Investido</label>
                                <input type="number" step="0.01" value={amountInvested} onChange={(e) => setAmountInvested(e.target.value)} className={inputClasses} required />
                            </div>
                             <div>
                                <label className={labelClasses}>Rentabilidade</label>
                                <input type="text" placeholder="Ex: 110% CDI" value={yieldRate} onChange={(e) => setYieldRate(e.target.value)} className={inputClasses} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Data de Vencimento</label>
                            <input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} className={inputClasses} required />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className={labelClasses}>Código / Ticker</label>
                            <input type="text" placeholder="Ex: PETR4, AAPL, BTC" value={ticker} onChange={(e) => setTicker(e.target.value)} className={inputClasses} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Quantidade</label>
                                <input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Preço de Compra (Unit.)</label>
                                <input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className={inputClasses} required />
                            </div>
                        </div>
                    </>
                )}
                
                <div>
                    <label className={labelClasses}>Data da Compra</label>
                    <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputClasses} required />
                </div>
                
                <div className="flex justify-end pt-2">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md">Adicionar Investimento</button>
                </div>
            </form>
        </Modal>
    );
};