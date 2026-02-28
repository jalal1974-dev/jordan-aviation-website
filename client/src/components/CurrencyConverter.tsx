import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertCurrency, formatPrice, SUPPORTED_CURRENCIES, getExchangeRate } from '@/lib/currencyConverter';

interface CurrencyConverterProps {
  amount: number;
  baseCurrency: string;
  onCurrencyChange?: (currency: string) => void;
}

export default function CurrencyConverter({
  amount,
  baseCurrency,
  onCurrencyChange,
}: CurrencyConverterProps) {
  const { language } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState(baseCurrency);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    onCurrencyChange?.(currency);
  };

  const convertedAmount = convertCurrency(amount, baseCurrency, selectedCurrency);
  const exchangeRate = getExchangeRate(baseCurrency, selectedCurrency);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'converter.title': 'Currency Converter',
        'converter.baseAmount': 'Base Amount',
        'converter.convertedAmount': 'Converted Amount',
        'converter.exchangeRate': 'Exchange Rate',
        'converter.selectCurrency': 'Select Currency',
        'converter.viewAll': 'View All Currencies',
        'converter.hideAll': 'Hide Currencies',
        'converter.rate': 'Rate',
      },
      ar: {
        'converter.title': 'محول العملات',
        'converter.baseAmount': 'المبلغ الأساسي',
        'converter.convertedAmount': 'المبلغ المحول',
        'converter.exchangeRate': 'سعر الصرف',
        'converter.selectCurrency': 'اختر العملة',
        'converter.viewAll': 'عرض جميع العملات',
        'converter.hideAll': 'إخفاء العملات',
        'converter.rate': 'السعر',
      },
    };

    return translations[language]?.[key] || key;
  };

  // Show popular currencies by default
  const popularCurrencies = SUPPORTED_CURRENCIES.filter((c) =>
    ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'JOD', 'EGP'].includes(c.code)
  );

  const displayCurrencies = showAllCurrencies ? SUPPORTED_CURRENCIES : popularCurrencies;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-primary">{t('converter.title')}</h3>
        </div>

        {/* Amount Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">{t('converter.baseAmount')}</p>
            <p className="text-lg font-bold text-primary">
              {formatPrice(amount, baseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{baseCurrency}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-accent/30">
            <p className="text-xs text-muted-foreground mb-1">{t('converter.convertedAmount')}</p>
            <p className="text-lg font-bold text-accent">
              {formatPrice(convertedAmount, selectedCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{selectedCurrency}</p>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="p-3 bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <ArrowRightLeft className="w-4 h-4" />
              {t('converter.exchangeRate')}
            </span>
            <span className="font-bold text-primary">
              1 {baseCurrency} = {exchangeRate.toFixed(4)} {selectedCurrency}
            </span>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('converter.selectCurrency')}
          </label>
          <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {displayCurrencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{currency.code}</span>
                    <span className="text-muted-foreground text-sm">{currency.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View All/Hide Button */}
        {SUPPORTED_CURRENCIES.length > popularCurrencies.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllCurrencies(!showAllCurrencies)}
            className="w-full text-xs"
          >
            {showAllCurrencies ? t('converter.hideAll') : t('converter.viewAll')}
          </Button>
        )}

        {/* Quick Conversion Grid */}
        {showAllCurrencies && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">{t('converter.rate')}</p>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_CURRENCIES.slice(0, 6).map((currency) => {
                const rate = getExchangeRate(baseCurrency, currency.code);
                return (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      selectedCurrency === currency.code
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    <div>{currency.code}</div>
                    <div className="text-xs opacity-75">{rate.toFixed(2)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
