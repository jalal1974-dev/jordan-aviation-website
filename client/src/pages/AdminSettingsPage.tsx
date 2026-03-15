import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('loyalty');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Loyalty settings state
  const [loyaltyMultiplier, setLoyaltyMultiplier] = useState('1.0');
  const [milesEarningRate, setMilesEarningRate] = useState('1.0');
  const [milesExpiryMonths, setMilesExpiryMonths] = useState('36');

  // Affiliate settings state
  const [affiliateCommissionRate, setAffiliateCommissionRate] = useState('0.1');
  const [minimumPayout, setMinimumPayout] = useState('100');
  const [payoutFrequency, setPayoutFrequency] = useState('monthly');

  // General settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxBookingsPerUser, setMaxBookingsPerUser] = useState('10');

  // Redirect if not admin
  if (user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const handleSaveLoyaltySettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage({ type: 'success', text: 'Loyalty settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save loyalty settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAffiliateSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage({ type: 'success', text: 'Affiliate settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save affiliate settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage({ type: 'success', text: 'General settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save general settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Program Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage loyalty, affiliate, and general program configurations</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Card className={`mb-6 p-4 border-l-4 ${message.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </Card>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
            <TabsTrigger value="affiliate">Affiliate Program</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* Loyalty Settings */}
          <TabsContent value="loyalty">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Loyalty Program Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">Configure how customers earn and redeem loyalty points</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Points Multiplier (points per $1 spent)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={loyaltyMultiplier}
                    onChange={(e) => setLoyaltyMultiplier(e.target.value)}
                    placeholder="1.0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Default: 1.0 point per dollar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Miles Earning Rate (miles per km)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={milesEarningRate}
                    onChange={(e) => setMilesEarningRate(e.target.value)}
                    placeholder="1.0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Default: 1.0 mile per kilometer</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Miles Expiry (months)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={milesExpiryMonths}
                    onChange={(e) => setMilesExpiryMonths(e.target.value)}
                    placeholder="36"
                  />
                  <p className="text-xs text-muted-foreground mt-1">How long miles are valid before expiration</p>
                </div>
              </div>

              <Button
                onClick={handleSaveLoyaltySettings}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Loyalty Settings'}
              </Button>
            </Card>
          </TabsContent>

          {/* Affiliate Settings */}
          <TabsContent value="affiliate">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Affiliate Program Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">Configure affiliate commission rates and payout terms</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Commission Rate (0-1, where 0.1 = 10%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={affiliateCommissionRate}
                    onChange={(e) => setAffiliateCommissionRate(e.target.value)}
                    placeholder="0.1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Commission earned per booking</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minimum Payout Amount (USD)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={minimumPayout}
                    onChange={(e) => setMinimumPayout(e.target.value)}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum earnings required to request payout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payout Frequency
                  </label>
                  <select
                    value={payoutFrequency}
                    onChange={(e) => setPayoutFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">How often affiliates receive payouts</p>
                </div>
              </div>

              <Button
                onClick={handleSaveAffiliateSettings}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Affiliate Settings'}
              </Button>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">General Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">Configure general platform settings</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div>
                    <label className="text-sm font-medium text-foreground">Maintenance Mode</label>
                    <p className="text-xs text-muted-foreground">Disable bookings temporarily for maintenance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Bookings Per User
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={maxBookingsPerUser}
                    onChange={(e) => setMaxBookingsPerUser(e.target.value)}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Maximum concurrent bookings per user</p>
                </div>
              </div>

              <Button
                onClick={handleSaveGeneralSettings}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
