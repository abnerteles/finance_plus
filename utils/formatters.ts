
export const formatCurrency = (value: number, compact = false): string => {
    if (compact) {
        if (Math.abs(value) >= 1_000_000) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                compactDisplay: 'short'
            }).format(value);
        }
        if (Math.abs(value) >= 1000) {
             return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                compactDisplay: 'short'
            }).format(value).replace(/\s/g, '');
        }
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
