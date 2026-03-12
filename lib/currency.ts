export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  NGN = 'NGN',
}

export const DEFAULT_CURRENCY: Currency = Currency.USD;

// Currency symbols and formatting options
const currencyConfig: Record<Currency, { symbol: string; locale: string }> = {
  [Currency.USD]: { symbol: '$', locale: 'en-US' },
  [Currency.EUR]: { symbol: '€', locale: 'de-DE' },
  [Currency.GBP]: { symbol: '£', locale: 'en-GB' },
  [Currency.NGN]: { symbol: '₦', locale: 'en-NG' },
};

/**
 * Format a price with the given currency code
 * @param price - The price number to format
 * @param currency - The currency code (USD, EUR, GBP, NGN)
 * @returns Formatted price string (e.g., "$29.99", "€29.99")
 */
export function formatCurrency(price: number | string, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return `${currency} 0.00`;
  }

  const config = currencyConfig[currency as Currency];
  
  if (!config) {
    // Fallback to simple formatting
    return `${currency} ${numPrice.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  } catch {
    return `${config.symbol}${numPrice.toFixed(2)}`;
  }
}

/**
 * Get currency symbol from currency code
 * @param currency - The currency code (USD, EUR, GBP, NGN)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  const config = currencyConfig[currency as Currency];
  return config ? config.symbol : '$';
}

/**
 * Get all available currencies
 * @returns Array of currency codes
 */
export function getAvailableCurrencies(): Currency[] {
  return Object.values(Currency);
}
