import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, Globe, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.book', href: '/book' },
  { key: 'nav.manage', href: '/manage-booking' },
  { key: 'nav.status', href: '/flight-status' },
  { key: 'nav.destinations', href: '/destinations' },
  { key: 'nav.offers', href: '/offers' },
  { key: 'nav.travel', href: '/travel-info' },
  { key: 'nav.help', href: '/help' },
  { key: 'nav.about', href: '/about' },
];

const currencies: Array<{ code: string; label: string }> = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'JOD', label: 'JOD - Jordanian Dinar' },
  { code: 'EGP', label: 'EGP - Egyptian Pound' },
  { code: 'AED', label: 'AED - UAE Dirham' },
  { code: 'KWD', label: 'KWD - Kuwaiti Dinar' },
  { code: 'SAR', label: 'SAR - Saudi Riyal' },
];

export default function Navigation() {
  const { language, setLanguage, currency, setCurrency, t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              JA
            </div>
            <span className="hidden sm:inline font-bold text-primary text-lg">
              Jordan Aviation
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">
                    {language.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ar')}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">
                    {currency}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                {currencies.map((curr) => (
                  <DropdownMenuItem
                    key={curr.code}
                    onClick={() => setCurrency(curr.code as any)}
                  >
                    {curr.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <div className="px-2 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
