import React from 'react';
import { SettingsIcon, SunIcon, MoonIcon } from './icons';
import { useTheme } from '../context/ThemeContext';

type ActiveView = 'dashboard' | 'cashflow' | 'investments';

interface HeaderProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    onOpenCategoryManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onOpenCategoryManager }) => {
    const { theme, toggleTheme } = useTheme();

    const navItemClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-indigo-600 text-white";
    const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    return (
        <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-30 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Finance-Plus</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <nav className="bg-gray-200/50 dark:bg-gray-700/50 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className={`${navItemClasses} ${activeView === 'dashboard' ? activeClasses : inactiveClasses}`}
                            >
                                Dashboard
                            </button>
                             <button
                                onClick={() => setActiveView('cashflow')}
                                className={`${navItemClasses} ${activeView === 'cashflow' ? activeClasses : inactiveClasses}`}
                            >
                                Fluxo de Caixa
                            </button>
                            <button
                                onClick={() => setActiveView('investments')}
                                className={`${navItemClasses} ${activeView === 'investments' ? activeClasses : inactiveClasses}`}
                            >
                                Investimentos
                            </button>
                        </nav>
                        <button onClick={onOpenCategoryManager} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Gerenciar categorias">
                            <SettingsIcon className="h-6 w-6" />
                        </button>
                         <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Alternar tema">
                           {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
