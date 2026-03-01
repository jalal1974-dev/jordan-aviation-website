import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, BarChart3, Users, Gift, TrendingUp, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function AdminDashboardLayout({ children, activeTab = 'overview' }: AdminDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-12 text-center">
        <p className="mb-4">You do not have access to the admin panel.</p>
        <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In as Admin</Button>
      </div>
    );
  }

  const menuItems = [
    {
      label: 'Overview',
      href: '/admin',
      icon: BarChart3,
      id: 'overview',
    },
    {
      label: 'Loyalty Program',
      href: '/admin/loyalty',
      icon: Gift,
      id: 'loyalty',
    },
    {
      label: 'Affiliate Program',
      href: '/admin/affiliate',
      icon: TrendingUp,
      id: 'affiliate',
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      id: 'analytics',
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      id: 'settings',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary/50 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/admin">
              <span className="text-xl font-bold text-primary cursor-pointer">Admin Panel</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-xs">Administrator</p>
            </div>
            <Button
              onClick={() => logout()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-border bg-secondary/5 min-h-screen">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Link key={item.id} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary/50 text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
