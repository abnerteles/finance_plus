import React, { useMemo, useState, useEffect } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { TransactionType } from '../types';
import type { Transaction, BankAccount, Investment } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, BankIcon, DollarSignIcon, WalletIcon, TrendingUpIcon, RocketIcon } from './icons';
import { getTopMovers } from '../services/marketDataService';
import type { MarketData } from '../services/marketDataService';


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

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const { accounts } = useFinancialData();
    const account = accounts.find(a => a.id === transaction.accountId);
    const isIncome = transaction.transactionType === TransactionType.INCOME;

    return (
        <div className="flex items-center justify-between py-3 px-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${isIncome ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isIncome ? <ArrowUpIcon className="h-5 w-5 text-green-500" /> : <ArrowDownIcon className="h-5 w-5 text-red-500" />}
                </div>
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{account?.name} • {transaction.category}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-semibold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
            </div>
        </div>
    );
};

const AccountsList: React.FC<{accounts: BankAccount[]}> = ({ accounts }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contas Bancárias</h3>
        <div className="space-y-3">
            {accounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <div className="flex items-center">
                        <WalletIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3" />
                        <div>
                             <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{account.bank}</p>
                        </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(account.balance ?? 0)}</p>
                </div>
            ))}
        </div>
    </div>
);

const InvestmentSummary: React.FC = () => {
    const { portfolioValue, portfolioPL, totalInvested, investments, marketData } = useFinancialData();
    const plPercentage = totalInvested > 0 ? portfolioPL / totalInvested : 0;
    
    const bestPerformer = useMemo(() => {
        if (investments.length === 0) return null;
        return investments.reduce((best, current) => {
            const bestPl = (marketData[best.ticker]?.price ?? best.purchasePrice) * best.quantity - (best.purchasePrice * best.quantity);
            const currentPl = (marketData[current.ticker]?.price ?? current.purchasePrice) * current.quantity - (current.purchasePrice * current.quantity);
            return currentPl > bestPl ? current : best;
        });
    }, [investments, marketData]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resumo de Investimentos</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Valor da Carteira</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(portfolioValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Lucro / Prejuízo</span>
                    <span className={`font-semibold ${portfolioPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(portfolioPL)} ({formatPercentage(plPercentage)})
                    </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Melhor Ativo</span>
                    {bestPerformer ? (
                         <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-gray-900 dark:text-white">{bestPerformer.ticker}</span>
                             <span className="text-sm text-green-500">+{formatCurrency((marketData[bestPerformer.ticker]?.price ?? bestPerformer.purchasePrice) * bestPerformer.quantity - (bestPerformer.purchasePrice * bestPerformer.quantity))}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Nenhum investimento.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const MarketMovers: React.FC = () => {
    const [topMovers, setTopMovers] = useState<any[]>([]);

    useEffect(() => {
        const fetchMovers = async () => {
            const allMarketData = await getTopMovers();
            const movers = Object.entries(allMarketData)
                .map(([ticker, data]) => ({
                    ticker,
                    ...data,
                    changePercent: (data.change / (data.price - data.change)) * 100
                }))
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 10);
            setTopMovers(movers);
        };
        fetchMovers();
    }, []);

     return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
                <RocketIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ativos em Destaque (Top 10)</h3>
            </div>
            <div className="space-y-2">
                {topMovers.map(mover => (
                    <div key={mover.ticker} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                        <span className="font-bold text-gray-900 dark:text-white">{mover.ticker}</span>
                        <span className="text-gray-600 dark:text-gray-300">{formatCurrency(mover.price)}</span>
                        <span className={`font-semibold ${mover.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {mover.changePercent >= 0 ? '+' : ''}{formatPercentage(mover.changePercent / 100)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}


const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} className="fill-gray-800 dark:fill-white">{`${formatCurrency(value)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} className="fill-gray-500 dark:fill-gray-400">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const Dashboard: React.FC = () => {
    const { totalBalance, transactions, accounts } = useFinancialData();
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const { monthlyIncome, monthlyExpense, monthlyChartData, expenseByCategoryData } = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let income = 0;
        let expense = 0;
        const expenseByCategory: { [key: string]: number } = {};
        
        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= firstDayOfMonth && t.transactionType !== TransactionType.TRANSFER);
        
        monthlyTransactions.forEach(t => {
            if (t.transactionType === TransactionType.INCOME) {
                income += t.amount;
            } else if (t.transactionType === TransactionType.EXPENSE) {
                expense += t.amount;
                expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
            }
        });

        const dailyData: { [key: string]: { income: number, expense: number } } = {};
        for(let i = 1; i <= now.getDate(); i++) {
            const day = new Date(now.getFullYear(), now.getMonth(), i).toLocaleDateString('pt-BR');
            dailyData[day] = { income: 0, expense: 0 };
        }
        monthlyTransactions.forEach(t => {
            const day = new Date(t.date).toLocaleDateString('pt-BR');
            if(dailyData[day]) {
                 if (t.transactionType === TransactionType.INCOME) dailyData[day].income += t.amount;
                 if (t.transactionType === TransactionType.EXPENSE) dailyData[day].expense += t.amount;
            }
        });
        const chartData = Object.entries(dailyData).map(([name, values]) => ({ name, ...values }));

        const expenseData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

        return { monthlyIncome: income, monthlyExpense: expense, monthlyChartData: chartData, expenseByCategoryData: expenseData };
    }, [transactions]);
    
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Saldo Total" value={formatCurrency(totalBalance)} icon={<BankIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />} />
                <KpiCard title="Receitas do Mês" value={formatCurrency(monthlyIncome)} icon={<ArrowUpIcon className="h-6 w-6 text-green-500" />} />
                <KpiCard title="Despesas do Mês" value={formatCurrency(monthlyExpense)} icon={<ArrowDownIcon className="h-6 w-6 text-red-500" />} />
                <KpiCard title="Balanço do Mês" value={formatCurrency(monthlyIncome - monthlyExpense)} icon={<DollarSignIcon className="h-6 w-6 text-yellow-500" />} 
                    subtext={`${(((monthlyIncome - monthlyExpense)/monthlyIncome)*100 || 0).toFixed(1)}% de economia`}
                    subtextColor={monthlyIncome - monthlyExpense > 0 ? "text-green-500" : "text-red-500"}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lançamentos Recentes</h3>
                    <div className="space-y-2">
                        {transactions.slice(0, 5).map(t => <TransactionItem key={t.id} transaction={t} />)}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Despesas por Categoria</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={expenseByCategoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {expenseByCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <InvestmentSummary />
                </div>
                <div className="lg:col-span-2">
                    <MarketMovers />
                </div>
            </div>

            <AccountsList accounts={accounts} />
        </div>
    );
};

export default Dashboard;