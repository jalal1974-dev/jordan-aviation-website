import { useState } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { Menu, X, Globe, DollarSign, Shield, LogIn, UserPlus, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getLoginUrl } from '@/const';
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

const userMenuItems = [
  { label: 'Notifications', href: '/notifications' },
  { label: 'Booking History', href: '/booking-history' },
  { label: 'My Profile', href: '/profile' },
  { label: 'Account Settings', href: '/user-profile' },
  { label: 'Loyalty Dashboard', href: '/loyalty' },
  { label: 'Redeem Miles', href: '/miles-redemption' },
  { label: 'Affiliate Program', href: '/affiliate' },
];

const adminMenuItems = [
  { label: 'Admin Dashboard', href: '/admin' },
  { label: 'Loyalty Management', href: '/admin/loyalty' },
  { label: 'Affiliate Management', href: '/admin/affiliate' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Settings', href: '/admin/settings' },
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
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
    setMobileMenuOpen(false);
  };

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

          {/* User/Admin Menu or Auth Buttons */}
          {user ? (
            <div className="hidden lg:flex items-center gap-2">
              {user.role === 'admin' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Admin</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                    {adminMenuItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <span className="text-xs font-medium">My Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                    {userMenuItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                <LogIn className="w-4 h-4" />
                <span className="text-xs font-medium">Sign In</span>
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-xs font-medium">Sign Up</span>
              </Button>
            </div>
          )}

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
              
              {user ? (
                <div className="border-t border-border pt-2 mt-2">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    {user.role === 'admin' ? 'Admin' : 'My Account'}
                  </p>
                  {(user.role === 'admin' ? adminMenuItems : userMenuItems).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-border pt-2 mt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 justify-start"
                    onClick={() => {
                      window.location.href = getLoginUrl();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full gap-2 justify-start bg-primary hover:bg-primary/90"
                    onClick={() => {
                      window.location.href = getLoginUrl();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
