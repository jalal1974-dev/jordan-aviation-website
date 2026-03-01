import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp } from 'lucide-react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { trpc } from '@/lib/trpc';

export default function AdminAffiliatePage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'referrals' | 'payments'>('applications');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | 'suspended' | undefined>();

  const { data: stats } = trpc.admin.affiliate.getProgramStats.useQuery();
  const { data: affiliates } = trpc.admin.affiliate.getAllAffiliates.useQuery({
    status: selectedStatus,
    limit: 50,
    offset: 0,
  });
  const { data: referrals } = trpc.admin.affiliate.getAllReferrals.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: payments } = trpc.admin.affiliate.getPayments.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: topPerformers } = trpc.admin.affiliate.getTopPerformers.useQuery({
    limit: 10,
  });

  const updateStatusMutation = trpc.admin.affiliate.updateAffiliateStatus.useMutation();
  const createPaymentMutation = trpc.admin.affiliate.createPayment.useMutation();

  const handleApproveAffiliate = async (affiliateId: number) => {
    await updateStatusMutation.mutateAsync({
      affiliateId,
      status: 'approved',
    });
  };

  const handleRejectAffiliate = async (affiliateId: number) => {
    await updateStatusMutation.mutateAsync({
      affiliateId,
      status: 'rejected',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'suspended':
        return <XCircle className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout activeTab="affiliate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Affiliate Program Management</h1>
          <p className="text-muted-foreground">Manage affiliates, referrals, and commission payments</p>
        </div>

        {/* Statistics */}
        {stats?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Affiliates</p>
                  <p className="text-3xl font-bold">{stats.stats?.totalAffiliates}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{stats.stats?.approvedAffiliates}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold">${stats.stats?.totalEarnings}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-3xl font-bold">${stats.stats?.totalPaid}</p>
                </div>
                <DollarSign className="w-8 h-8 text-accent opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {(['applications', 'referrals', 'payments'] as const).map((tab) => (
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

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {(['pending', 'approved', 'rejected', 'suspended'] as const).map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(selectedStatus === status ? undefined : status)}
                  size="sm"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {affiliates?.affiliates?.map((affiliate: any) => (
                <Card key={affiliate.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getStatusIcon(affiliate.status)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{affiliate.companyName || `Affiliate #${affiliate.id}`}</h3>
                        <p className="text-sm text-muted-foreground">{affiliate.contactEmail}</p>
                        {affiliate.website && (
                          <p className="text-sm text-muted-foreground">{affiliate.website}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Commission Rate</p>
                      <p className="text-2xl font-bold">{affiliate.commissionRate}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Referrals</p>
                      <p className="font-bold">{affiliate.totalReferrals}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversions</p>
                      <p className="font-bold">{affiliate.totalConversions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Earnings</p>
                      <p className="font-bold">${parseFloat(affiliate.totalEarnings.toString()).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-bold">{new Date(affiliate.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {affiliate.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveAffiliate(affiliate.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectAffiliate(affiliate.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Referrals</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Affiliate</th>
                    <th className="text-left py-3 px-4">Referral Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Commission</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals?.referrals?.map((referral: any) => (
                    <tr key={referral.id} className="border-b border-border hover:bg-secondary/5">
                      <td className="py-3 px-4 font-medium">Affiliate #{referral.affiliateId}</td>
                      <td className="py-3 px-4">{referral.referredEmail || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        ${parseFloat(referral.commissionAmount?.toString() || '0').toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{new Date(referral.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Affiliate</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.payments?.map((payment: any) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-secondary/5">
                        <td className="py-3 px-4 font-medium">Affiliate #{payment.affiliateId}</td>
                        <td className="py-3 px-4 text-right font-bold">
                          ${parseFloat(payment.amount.toString()).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{payment.paymentMethod}</td>
                        <td className="py-3 px-4 text-xs">
                          {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Top Performers</h2>
              <div className="space-y-3">
                {topPerformers?.affiliates?.map((affiliate: any, index: number) => (
                  <div key={affiliate.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                      <div>
                        <p className="font-medium">{affiliate.companyName || `Affiliate #${affiliate.id}`}</p>
                        <p className="text-sm text-muted-foreground">{affiliate.totalReferrals} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${parseFloat(affiliate.totalEarnings.toString()).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
