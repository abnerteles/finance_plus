export interface MarketInfo {
    price: number;
    change: number;
    signal: 'Comprar' | 'Vender' | 'Manter';
}

export interface MarketData {
    [ticker: string]: MarketInfo;
}

const mockMarketData: MarketData = {
    // B3
    'PETR4': { price: 38.15, change: 0.5, signal: 'Manter' },
    'VALE3': { price: 61.50, change: -0.8, signal: 'Manter' },
    'ITUB4': { price: 32.20, change: 0.1, signal: 'Manter' },
    'BBDC4': { price: 13.50, change: -0.2, signal: 'Vender' },
    'MGLU3': { price: 12.80, change: 1.2, signal: 'Comprar' },
    'WEGE3': { price: 35.70, change: 0.4, signal: 'Manter' },
    'ABEV3': { price: 14.10, change: 0.05, signal: 'Manter' },
    'MXRF11': { price: 10.80, change: 0.05, signal: 'Manter' },
    'HGLG11': { price: 165.40, change: 1.1, signal: 'Comprar' },
    'KNCR11': { price: 102.30, change: -0.1, signal: 'Manter' },
    // International
    'AAPL': { price: 172.50, change: -1.2, signal: 'Manter' },
    'GOOGL': { price: 175.30, change: 2.1, signal: 'Comprar' },
    'MSFT': { price: 420.70, change: 1.5, signal: 'Comprar' },
    'AMZN': { price: 185.00, change: -0.5, signal: 'Manter' },
    'TSLA': { price: 180.20, change: -5.6, signal: 'Vender' },
    'O': { price: 62.45, change: -0.25, signal: 'Manter' },
    'SPG': { price: 150.80, change: 0.9, signal: 'Manter' },
    // Crypto
    'BTC': { price: 68500.00, change: 1200, signal: 'Comprar' },
    'ETH': { price: 3500.00, change: -50, signal: 'Vender' },
    'SOL': { price: 170.00, change: 15, signal: 'Comprar' },
};

const getSignal = (price: number, change: number): 'Comprar' | 'Vender' | 'Manter' => {
    const percentageChange = (change / (price - change)) * 100;
    if (percentageChange > 2) return 'Comprar';
    if (percentageChange < -2) return 'Vender';
    return 'Manter';
}


// Simulate API call
export const getMarketData = (tickers: string[]): Promise<MarketData> => {
    console.log(`Fetching market data for: ${tickers.join(', ')}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const result: MarketData = {};
            tickers.forEach(ticker => {
                if (mockMarketData[ticker]) {
                    result[ticker] = mockMarketData[ticker];
                } else {
                    const randomPrice = Math.random() * 200 + 10;
                    const randomChange = Math.random() * 10 - 5;
                    result[ticker] = {
                        price: parseFloat(randomPrice.toFixed(2)),
                        change: parseFloat(randomChange.toFixed(2)),
                        signal: getSignal(randomPrice, randomChange)
                    };
                }
            });
            resolve(result);
        }, 500);
    });
};

export const getTopMovers = (): Promise<MarketData> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockMarketData);
        }, 300);
    });
}

// Simulate real-time updates
let intervalId: number | null = null;
export const subscribeToMarketUpdates = (
    tickers: string[],
    callback: (data: MarketData | ((prevData: MarketData) => MarketData)) => void
): (() => void) => {
    
    if (intervalId) {
        clearInterval(intervalId);
    }

    intervalId = window.setInterval(() => {
        const updatedData: MarketData = {};
        const allTickers = [...new Set([...tickers, ...Object.keys(mockMarketData)])];

        allTickers.forEach(ticker => {
            const currentData = mockMarketData[ticker];
            if (currentData) {
                const changeFactor = (Math.random() - 0.5) * 0.02; 
                const priceChange = currentData.price * changeFactor;
                currentData.price += priceChange;
                currentData.change = priceChange;
                currentData.signal = getSignal(currentData.price, currentData.change);
                
                updatedData[ticker] = {
                    price: parseFloat(currentData.price.toFixed(2)),
                    change: parseFloat(currentData.change.toFixed(2)),
                    signal: currentData.signal,
                };
            }
        });
        
        callback(prevData => ({ ...prevData, ...updatedData }));

    }, 3000);

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
};