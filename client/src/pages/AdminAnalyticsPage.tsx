import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { trpc } from '@/lib/trpc';

export default function AdminAnalyticsPage() {
  const { data: loyaltyStats } = trpc.admin.loyalty.getProgramStats.useQuery();
  const { data: loyaltyDistribution } = trpc.admin.loyalty.getTierDistribution.useQuery();
  const { data: affiliateStats } = trpc.admin.affiliate.getProgramStats.useQuery();
  const { data: topAffiliates } = trpc.admin.affiliate.getTopPerformers.useQuery({ limit: 10 });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const loyaltyChartData = loyaltyDistribution?.distribution?.map((item: any) => ({
    name: item.tierName,
    value: item.userCount,
    percentage: item.percentage,
  })) || [];

  const affiliateChartData = topAffiliates?.affiliates?.map((aff: any) => ({
    name: `Affiliate #${aff.id}`,
    earnings: parseFloat(aff.totalEarnings.toString()),
    referrals: aff.totalReferrals,
  })) || [];

  return (
    <AdminDashboardLayout activeTab="analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Program Analytics & Reporting</h1>
          <p className="text-muted-foreground">Comprehensive insights into loyalty and affiliate program performance</p>
        </div>

        {/* Loyalty Program Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Loyalty Program Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Members</p>
              <p className="text-3xl font-bold">{loyaltyStats?.stats?.totalMembers || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {loyaltyStats?.stats?.activeMembers || 0} active
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Points in Circulation</p>
              <p className="text-3xl font-bold">
                {((loyaltyStats?.stats?.totalPointsIssued || 0) - (loyaltyStats?.stats?.totalPointsRedeemed || 0)).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {loyaltyStats?.stats?.totalPointsIssued || 0} issued
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Redemption Rate</p>
              <p className="text-3xl font-bold">
                {loyaltyStats?.stats?.totalPointsIssued
                  ? (((loyaltyStats.stats.totalPointsRedeemed || 0) / (loyaltyStats.stats.totalPointsIssued || 1)) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {loyaltyStats?.stats?.totalPointsRedeemed || 0} redeemed
              </p>
            </Card>
          </div>

          {loyaltyChartData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Member Distribution by Tier</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={loyaltyChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {loyaltyChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Affiliate Program Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Affiliate Program Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Affiliates</p>
              <p className="text-3xl font-bold">{affiliateStats?.stats?.totalAffiliates || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {affiliateStats?.stats?.approvedAffiliates || 0} approved
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
              <p className="text-3xl font-bold">
                ${parseFloat((affiliateStats?.stats?.totalPaid as any)?.toString() || '0').toFixed(0)} paid
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ${parseFloat(affiliateStats?.stats?.totalPaid?.toString() || '0').toFixed(0)} paid
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Payout Rate</p>
              <p className="text-3xl font-bold">
                {affiliateStats?.stats?.totalEarnings
                  ? (((Number(affiliateStats.stats.totalPaid) || 0) / (Number(affiliateStats.stats.totalEarnings) || 1)) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {affiliateStats?.stats?.pendingPayments || 0} pending
              </p>
            </Card>
          </div>

          {affiliateChartData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Top Affiliates by Earnings</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={affiliateChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="earnings" fill="#3b82f6" name="Earnings ($)" />
                  <Bar dataKey="referrals" fill="#10b981" name="Referrals" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Loyalty Program Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Points per Member</span>
                <span className="font-bold">
                  {loyaltyStats?.stats?.totalMembers && loyaltyStats?.stats?.totalPointsIssued
                    ? (loyaltyStats.stats.totalPointsIssued / loyaltyStats.stats.totalMembers).toFixed(0)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Member Rate</span>
                <span className="font-bold">
                  {loyaltyStats?.stats?.totalMembers && loyaltyStats?.stats?.activeMembers
                    ? (((loyaltyStats.stats.activeMembers || 0) / (loyaltyStats.stats.totalMembers || 1)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Redemption Value</span>
                <span className="font-bold">
                  {loyaltyStats?.stats?.totalPointsRedeemed && loyaltyStats?.stats?.totalMembers
                    ? (loyaltyStats.stats.totalPointsRedeemed / loyaltyStats.stats.totalMembers).toFixed(0)
                    : 0}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Affiliate Program Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Commission Rate</span>
                <span className="font-bold">
                  {affiliateStats?.stats?.totalAffiliates ? '5-15%' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-bold">
                  {affiliateStats?.stats?.totalAffiliates && affiliateStats?.stats?.approvedAffiliates
                    ? (((affiliateStats.stats.approvedAffiliates || 0) / (affiliateStats.stats.totalAffiliates || 1)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Earnings per Affiliate</span>
                <span className="font-bold">
                  ${affiliateStats?.stats?.totalAffiliates && affiliateStats?.stats?.totalEarnings
                    ? (parseFloat((affiliateStats.stats.totalEarnings as any)?.toString() || '0') / (affiliateStats.stats.totalAffiliates || 1)).toFixed(2)
                    : 0}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Insights */}
        <Card className="p-6 bg-secondary/5 border-secondary">
          <h3 className="text-lg font-bold mb-4">Key Insights</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Loyalty program has {loyaltyStats?.stats?.totalMembers || 0} members with an active engagement rate of{' '}
                {loyaltyStats?.stats?.totalMembers && loyaltyStats?.stats?.activeMembers
                  ? (((loyaltyStats.stats.activeMembers || 0) / (loyaltyStats.stats.totalMembers || 1)) * 100).toFixed(1)
                  : 0}%
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Affiliate program has {affiliateStats?.stats?.approvedAffiliates || 0} active partners generating{' '}
                ${parseFloat((affiliateStats?.stats?.totalEarnings as any)?.toString() || '0').toFixed(0)} in total earnings
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Current payout rate is{' '}
                {affiliateStats?.stats?.totalEarnings
                  ? (((Number(affiliateStats.stats.totalPaid) || 0) / (Number(affiliateStats.stats.totalEarnings) || 1)) * 100).toFixed(1)
                  : 0}% with {affiliateStats?.stats?.pendingPayments || 0} pending payments
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
