import React, { useMemo } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon, EditIcon, TrashIcon } from './icons';
import type { Investment, FixedIncomeInvestment, AnyInvestment } from '../types';
import { AssetType } from '../types';

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subtext?: string; subtextColor?: string }> = ({ title, value, icon, subtext, subtextColor = 'text-gray-500 dark:text-gray-400' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-start">
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mr-4">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {subtext && <p className={`text-xs ${subtextColor}`}>{subtext}</p>}
        </div>
    </div>
);

const SignalBadge: React.FC<{ signal: 'Comprar' | 'Vender' | 'Manter' | undefined }> = ({ signal }) => {
    if (!signal) return null;
    const colors = {
        'Comprar': 'bg-green-500/20 text-green-500',
        'Vender': 'bg-red-500/20 text-red-500',
        'Manter': 'bg-yellow-500/20 text-yellow-500',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[signal]}`}>
            {signal}
        </span>
    );
};


const VariableAssetTable: React.FC<{ title: string; assets: Investment[]; onEdit: (asset: Investment) => void; onDelete: (id: string) => void; }> = ({ title, assets, onEdit, onDelete }) => {
    const { marketData } = useFinancialData();
    if (assets.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <h2 className="p-4 text-lg font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/50">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/30">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ativo</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Análise</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Preço Atual</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Quantidade</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Valor Total</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">L/P</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Variação</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {assets.map(inv => {
                            const currentPrice = marketData[inv.ticker]?.price ?? inv.purchasePrice;
                            const totalValue = currentPrice * inv.quantity;
                            const pl = totalValue - (inv.purchasePrice * inv.quantity);
                            const plPercentage = (pl / (inv.purchasePrice * inv.quantity));
                            const isPositive = pl >= 0;
                            const signal = marketData[inv.ticker]?.signal;

                            return (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 dark:text-white">{inv.ticker}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{inv.type}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <SignalBadge signal={signal} />
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">{formatCurrency(currentPrice)}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">{inv.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 8 })}</td>
                                    <td className="p-4 font-semibold text-gray-900 dark:text-white text-right whitespace-nowrap">{formatCurrency(totalValue)}</td>
                                    <td className={`p-4 font-semibold text-right whitespace-nowrap ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {formatCurrency(pl)}
                                    </td>
                                    <td className={`p-4 text-sm text-right whitespace-nowrap ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {formatPercentage(plPercentage)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => onEdit(inv)} className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-1 rounded-full"><EditIcon className="h-5 w-5"/></button>
                                            <button onClick={() => onDelete(inv.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FixedIncomeTable: React.FC<{ assets: FixedIncomeInvestment[]; onEdit: (asset: FixedIncomeInvestment) => void; onDelete: (id: string) => void; }> = ({ assets, onEdit, onDelete }) => {
    if (assets.length === 0) return null;

    return (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <h2 className="p-4 text-lg font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/50">Renda Fixa</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/30">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ativo</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Emissor</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rentabilidade</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Compra</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimento</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Valor Investido</th>
                             <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {assets.map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="p-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{inv.name}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{inv.issuer}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{inv.yieldRate}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(inv.purchaseDate)}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(inv.maturityDate)}</td>
                                <td className="p-4 font-semibold text-gray-900 dark:text-white text-right whitespace-nowrap">{formatCurrency(inv.amountInvested)}</td>
                                 <td className="p-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => onEdit(inv)} className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-1 rounded-full"><EditIcon className="h-5 w-5"/></button>
                                        <button onClick={() => onDelete(inv.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface InvestmentsProps {
    onEditInvestment: (investment: AnyInvestment) => void;
}

const Investments: React.FC<InvestmentsProps> = ({ onEditInvestment }) => {
    const { 
        investments, 
        fixedIncomeInvestments, 
        totalInvested, 
        portfolioValue, 
        portfolioPL,
        deleteInvestment,
        deleteFixedIncomeInvestment
    } = useFinancialData();
    
    const portfolioPLPercentage = totalInvested > 0 ? portfolioPL / totalInvested : 0;

    const { b3Assets, internationalAssets, cryptoAssets } = useMemo(() => {
        return {
            b3Assets: investments.filter(inv => inv.type === AssetType.STOCK || inv.type === AssetType.REAL_ESTATE_FUND),
            internationalAssets: investments.filter(inv => inv.type === AssetType.INTERNATIONAL_STOCK || inv.type === AssetType.REIT),
            cryptoAssets: investments.filter(inv => inv.type === AssetType.CRYPTO)
        };
    }, [investments]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carteira de Investimentos</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Investido" value={formatCurrency(totalInvested)} icon={<TrendingUpIcon className="h-6 w-6 text-teal-500 dark:text-teal-400" />} />
                <KpiCard title="Valor da Carteira" value={formatCurrency(portfolioValue)} icon={<TrendingUpIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />} />
                <KpiCard 
                    title="Lucro / Prejuízo" 
                    value={formatCurrency(portfolioPL)} 
                    icon={portfolioPL >= 0 ? <ArrowUpIcon className="h-6 w-6 text-green-500" /> : <ArrowDownIcon className="h-6 w-6 text-red-500" />}
                    subtext={formatPercentage(portfolioPLPercentage)}
                    subtextColor={portfolioPL >= 0 ? 'text-green-500' : 'text-red-500'}
                />
            </div>

            <div className="space-y-8">
                <VariableAssetTable title="B3 (Ações e FIIs)" assets={b3Assets} onEdit={onEditInvestment} onDelete={deleteInvestment} />
                <VariableAssetTable title="Internacional (Ações e REITs)" assets={internationalAssets} onEdit={onEditInvestment} onDelete={deleteInvestment} />
                <VariableAssetTable title="Criptomoedas" assets={cryptoAssets} onEdit={onEditInvestment} onDelete={deleteInvestment} />
                <FixedIncomeTable assets={fixedIncomeInvestments} onEdit={onEditInvestment} onDelete={deleteFixedIncomeInvestment} />
            </div>
        </div>
    );
};

export default Investments;