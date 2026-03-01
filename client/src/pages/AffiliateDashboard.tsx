import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, TrendingUp, DollarSign, Users, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export default function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: affiliate } = trpc.affiliate.getMyAccount.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = trpc.affiliate.getStats.useQuery(undefined, {
    enabled: !!user && !!affiliate,
  });

  const { data: referrals, isLoading: referralsLoading } = trpc.affiliate.getReferrals.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !!user && !!affiliate }
  );

  const { data: shareLink } = trpc.affiliate.getShareLink.useQuery(undefined, {
    enabled: !!user && !!affiliate,
  });

  const registerMutation = trpc.affiliate.register.useMutation();

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card className="p-8 text-center">
          <p className="mb-4">Please log in to join our affiliate program</p>
          <Button>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Affiliate Program</h1>
          <p className="text-muted-foreground">Earn commissions by referring customers to Jordan Aviation</p>
        </div>

        <Card className="p-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Join Our Affiliate Program</h2>
          <p className="text-muted-foreground mb-6">
            Become a Jordan Aviation affiliate and earn competitive commissions on every successful booking referred through your unique link.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              registerMutation.mutate({
                companyName: formData.get('companyName') as string,
                website: formData.get('website') as string,
                contactEmail: formData.get('contactEmail') as string,
                contactPhone: formData.get('contactPhone') as string,
                commissionRate: 5,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Company Name (Optional)</label>
              <input
                type="text"
                name="companyName"
                className="w-full px-4 py-2 border border-border rounded-lg"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website (Optional)</label>
              <input
                type="url"
                name="website"
                className="w-full px-4 py-2 border border-border rounded-lg"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                required
                className="w-full px-4 py-2 border border-border rounded-lg"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                className="w-full px-4 py-2 border border-border rounded-lg"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {registerMutation.isPending ? 'Registering...' : 'Register as Affiliate'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">Track your referrals and earnings</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Clicks</h3>
              <LinkIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">{stats.clicks}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sign-ups</h3>
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-secondary">{stats.signups}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Conversions</h3>
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.conversionRate.toFixed(1)}% conversion rate
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Earnings</h3>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${parseFloat(stats.affiliate.totalEarnings.toString()).toFixed(2)}
            </div>
          </Card>
        </div>
      )}

      {shareLink && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Referral Link</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink.shareLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-secondary/5"
                />
                <Button
                  onClick={() => copyToClipboard(shareLink.shareLink)}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Affiliate Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink.affiliateCode}
                  readOnly
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-secondary/5"
                />
                <Button
                  onClick={() => copyToClipboard(shareLink.affiliateCode)}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Referrals</h2>
        {referralsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading referrals...</div>
        ) : referrals && referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-right py-3 px-4 font-semibold">Commission</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-border hover:bg-secondary/5">
                    <td className="py-3 px-4 text-sm">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">{referral.referredEmail || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      ${parseFloat(referral.commissionAmount?.toString() || '0').toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No referrals yet</div>
        )}
      </Card>
    </div>
  );
}
