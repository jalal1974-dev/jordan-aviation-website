import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Users, TrendingUp } from 'lucide-react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { trpc } from '@/lib/trpc';

export default function AdminLoyaltyPage() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'users' | 'history'>('tiers');
  const [showCreateTier, setShowCreateTier] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [adjustmentUserId, setAdjustmentUserId] = useState<number | null>(null);

  const { data: tiers, isLoading: tiersLoading } = trpc.admin.loyalty.getAllTiers.useQuery();
  const { data: stats } = trpc.admin.loyalty.getProgramStats.useQuery();
  const { data: distribution } = trpc.admin.loyalty.getTierDistribution.useQuery();
  const { data: users } = trpc.admin.loyalty.getAllUsersWithPoints.useQuery({
    limit: 50,
    offset: 0,
  });

  const createTierMutation = trpc.admin.loyalty.createTier.useMutation();
  const updateTierMutation = trpc.admin.loyalty.updateTier.useMutation();
  const deleteTierMutation = trpc.admin.loyalty.deleteTier.useMutation();
  const adjustPointsMutation = trpc.admin.loyalty.adjustUserPoints.useMutation();

  const handleCreateTier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createTierMutation.mutateAsync({
      name: formData.get('name') as string,
      nameAr: formData.get('nameAr') as string,
      minPoints: parseInt(formData.get('minPoints') as string),
      pointsMultiplier: parseFloat(formData.get('multiplier') as string),
      benefits: formData.get('benefits') as string,
      isActive: true,
    });
    setShowCreateTier(false);
  };

  const handleAdjustPoints = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await adjustPointsMutation.mutateAsync({
      userId: parseInt(formData.get('userId') as string),
      pointsAdjustment: parseInt(formData.get('adjustment') as string),
      reason: formData.get('reason') as string,
      description: formData.get('description') as string,
    });
    setAdjustmentUserId(null);
  };

  return (
    <AdminDashboardLayout activeTab="loyalty">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Loyalty Program Management</h1>
          <p className="text-muted-foreground">Manage loyalty tiers, user points, and program settings</p>
        </div>

        {/* Statistics */}
        {stats?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-3xl font-bold">{stats.stats?.totalMembers}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-3xl font-bold">{stats.stats?.activeMembers}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Points Issued</p>
                <p className="text-3xl font-bold">{stats.stats?.totalPointsIssued?.toLocaleString()}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Points Redeemed</p>
                <p className="text-3xl font-bold">{stats.stats?.totalPointsRedeemed?.toLocaleString()}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {(['tiers', 'users', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Loyalty Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Loyalty Tiers</h2>
              <Button onClick={() => setShowCreateTier(!showCreateTier)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Tier
              </Button>
            </div>

            {showCreateTier && (
              <Card className="p-6">
                <form onSubmit={handleCreateTier} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tier Name (EN)</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="e.g., Gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tier Name (AR)</label>
                      <input
                        type="text"
                        name="nameAr"
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="e.g., ذهبي"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Points</label>
                      <input
                        type="number"
                        name="minPoints"
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Points Multiplier</label>
                      <input
                        type="number"
                        name="multiplier"
                        step="0.1"
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Benefits</label>
                    <textarea
                      name="benefits"
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="List tier benefits"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createTierMutation.isPending}>
                      {createTierMutation.isPending ? 'Creating...' : 'Create Tier'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateTier(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiers?.tiers?.map((tier: any) => (
                <Card key={tier.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.nameAr}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTierMutation.mutate({ tierId: tier.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Min Points:</span>
                      <span className="font-medium ml-2">{tier.minPoints.toLocaleString()}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Multiplier:</span>
                      <span className="font-medium ml-2">{tier.pointsMultiplier}x</span>
                    </p>
                    {tier.benefitsDescription && (
                      <p>
                        <span className="text-muted-foreground">Benefits:</span>
                        <span className="ml-2">{tier.benefitsDescription}</span>
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Points Management</h2>
              <Button onClick={() => setAdjustmentUserId(1)} className="gap-2">
                <Plus className="w-4 h-4" />
                Adjust Points
              </Button>
            </div>

            {adjustmentUserId && (
              <Card className="p-6">
                <form onSubmit={handleAdjustPoints} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">User ID</label>
                    <input
                      type="number"
                      name="userId"
                      required
                      defaultValue={adjustmentUserId}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Points Adjustment</label>
                      <input
                        type="number"
                        name="adjustment"
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="100 or -50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <input
                        type="text"
                        name="reason"
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="e.g., Complaint Resolution"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={adjustPointsMutation.isPending}>
                      {adjustPointsMutation.isPending ? 'Adjusting...' : 'Adjust Points'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAdjustmentUserId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Users with Points</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">User ID</th>
                      <th className="text-right py-3 px-4">Total Points</th>
                      <th className="text-right py-3 px-4">Available</th>
                      <th className="text-right py-3 px-4">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.users?.map((user: any) => (
                      <tr key={user.id} className="border-b border-border hover:bg-secondary/5">
                        <td className="py-3 px-4">{user.userId}</td>
                        <td className="text-right py-3 px-4 font-medium">
                          {user.totalPoints.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {user.availablePoints.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {user.redeemedPoints.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tier Distribution */}
        {activeTab === 'history' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Tier Distribution</h2>
            <div className="space-y-4">
              {distribution?.distribution?.map((item: any) => (
                <div key={item.tierId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{item.tierName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.minPoints.toLocaleString()}+ points
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.userCount}</p>
                    <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
