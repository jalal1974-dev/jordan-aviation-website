// Real-time exchange rates (in production, these would be fetched from an API)
// Using approximate rates as of Feb 2026
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  JOD: 0.71,
  EGP: 30.9,
  KWD: 0.31,
  QAR: 3.64,
  OMR: 0.38,
  BHD: 0.38,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  SGD: 1.34,
  HKD: 7.81,
  JPY: 149.5,
  KRW: 1319.5,
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
  { code: 'SAR', label: 'Saudi Riyal (﷼)', symbol: '﷼' },
  { code: 'JOD', label: 'Jordanian Dinar (د.ا)', symbol: 'د.ا' },
  { code: 'EGP', label: 'Egyptian Pound (£)', symbol: '£' },
  { code: 'KWD', label: 'Kuwaiti Dinar (د.ك)', symbol: 'د.ك' },
  { code: 'QAR', label: 'Qatari Riyal (ر.ق)', symbol: 'ر.ق' },
  { code: 'OMR', label: 'Omani Rial (ر.ع.)', symbol: 'ر.ع.' },
  { code: 'BHD', label: 'Bahraini Dinar (د.ب)', symbol: 'د.ب' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { code: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
  { code: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { code: 'HKD', label: 'Hong Kong Dollar (HK$)', symbol: 'HK$' },
  { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'KRW', label: 'South Korean Won (₩)', symbol: '₩' },
];

/**
 * Convert amount from one currency to another
 * @param amount Amount in base currency (USD)
 * @param fromCurrency Source currency code
 * @param toCurrency Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first if not already
  const amountInUSD = fromCurrency === 'USD' ? amount : amount / (EXCHANGE_RATES[fromCurrency] || 1);

  // Convert from USD to target currency
  const convertedAmount = amountInUSD * (EXCHANGE_RATES[toCurrency] || 1);

  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);

  // For currencies that use symbol before amount
  if (['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'CNY', 'JPY', 'KRW', 'SGD', 'HKD'].includes(currencyCode)) {
    return `${symbol}${amount.toFixed(2)}`;
  }

  // For currencies that use symbol after amount
  return `${amount.toFixed(2)} ${symbol}`;
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;

  const rateFromUSD = EXCHANGE_RATES[toCurrency] || 1;
  const rateToUSD = EXCHANGE_RATES[fromCurrency] || 1;

  return Math.round((rateFromUSD / rateToUSD) * 10000) / 10000;
}
