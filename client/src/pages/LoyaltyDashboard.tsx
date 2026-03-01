import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, History, Award, Zap } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export default function LoyaltyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [redeemPoints, setRedeemPoints] = useState<number | null>(null);

  const { data: loyaltyStatus, isLoading: statusLoading } = trpc.loyalty.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: pointHistory, isLoading: historyLoading } = trpc.loyalty.getPointHistory.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  const { data: tiers } = trpc.loyalty.getTiers.useQuery();
  const redeemMutation = trpc.loyalty.redeemPoints.useMutation();

  if (authLoading || statusLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading loyalty information...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card className="p-8 text-center">
          <p className="mb-4">Please log in to view your loyalty program status</p>
          <Button>Sign In</Button>
        </Card>
      </div>
    );
  }

  const handleRedeem = async () => {
    if (!redeemPoints || redeemPoints <= 0) return;

    try {
      await redeemMutation.mutateAsync({
        pointsToRedeem: redeemPoints,
        reason: 'Manual redemption',
        description: `Redeemed ${redeemPoints} points for discount`,
      });
      setRedeemPoints(null);
    } catch (error) {
      console.error('Redemption failed:', error);
    }
  };

  const tierClass = loyaltyStatus?.currentTierId;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Loyalty Program</h1>
        <p className="text-muted-foreground">Earn points on every booking and unlock exclusive rewards</p>
      </div>

      {loyaltyStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Points</h3>
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div className="text-4xl font-bold text-primary mb-2">
              {loyaltyStatus.availablePoints.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Total: {loyaltyStatus.totalPoints.toLocaleString()} points
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current Tier</h3>
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-secondary mb-2">
              {loyaltyStatus.tier?.name || 'Bronze'}
            </div>
            <p className="text-sm text-muted-foreground">
              {loyaltyStatus.tier?.pointsMultiplier}x points multiplier
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-secondary/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Redeemed Points</h3>
              <Gift className="w-6 h-6 text-accent" />
            </div>
            <div className="text-4xl font-bold text-accent mb-2">
              {loyaltyStatus.redeemedPoints.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Lifetime redemptions</p>
          </Card>
        </div>
      )}

      {tiers && tiers.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Loyalty Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {tiers.map((tier) => {
              const isCurrentTier = tierClass === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrentTier ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tier.minPoints.toLocaleString()}+ points
                  </p>
                  <div className="text-xs text-accent font-semibold">
                    {tier.pointsMultiplier}x multiplier
                  </div>
                  {isCurrentTier && (
                    <div className="mt-3 text-xs font-bold text-primary">Current Tier</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Redeem Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Points to Redeem</label>
            <input
              type="number"
              value={redeemPoints || ''}
              onChange={(e) => setRedeemPoints(parseInt(e.target.value) || 0)}
              max={loyaltyStatus?.availablePoints || 0}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter points"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Available: {loyaltyStatus?.availablePoints.toLocaleString() || 0} points
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estimated Discount</label>
            <div className="px-4 py-2 bg-secondary/10 rounded-lg border border-border">
              <div className="text-2xl font-bold text-secondary">
                ${((redeemPoints || 0) * 0.01).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">1 point = $0.01</p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleRedeem}
          disabled={!redeemPoints || redeemPoints <= 0 || redeemMutation.isPending}
          className="w-full mt-6 bg-primary hover:bg-primary/90"
        >
          {redeemMutation.isPending ? 'Processing...' : 'Redeem Points'}
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Point History</h2>
        </div>
        {historyLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading history...</div>
        ) : pointHistory && pointHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Reason</th>
                  <th className="text-right py-3 px-4 font-semibold">Points</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {pointHistory.map((entry) => {
                  const isPositive = entry.pointsChange > 0;
                  return (
                    <tr key={entry.id} className="border-b border-border hover:bg-secondary/5">
                      <td className="py-3 px-4 text-sm">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{entry.reason}</td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{entry.pointsChange}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {entry.description || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No point history yet</div>
        )}
      </Card>
    </div>
  );
}
