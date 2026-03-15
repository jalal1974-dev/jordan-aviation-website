import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { User, Plane, Gift, Settings, LogOut } from 'lucide-react';

export default function ProfileDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const fullProfileQuery = trpc.profile.getFullProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const milesBalanceQuery = trpc.profile.getMilesBalance.useQuery(undefined, {
    enabled: !!user,
  });

  const milesHistoryQuery = trpc.profile.getMilesHistory.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  const profileCompletenessQuery = trpc.profile.getProfileCompleteness.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your profile.
          </p>
          <Button onClick={() => setLocation('/')} className="w-full">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const profile = fullProfileQuery.data?.profile;
  const milesBalance = milesBalanceQuery.data;
  const milesHistory = milesHistoryQuery.data || [];
  const completeness = profileCompletenessQuery.data?.completeness || 0;

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Welcome, {user.name || 'Traveler'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your profile and track your miles
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Profile Completeness */}
        {completeness < 100 && (
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-blue-800">
                  {completeness}% complete - Add more information to unlock benefits
                </p>
              </div>
              <div className="w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Miles Overview */}
        {milesBalance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Total Miles</h3>
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">
                {milesBalance.totalMiles.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Available Miles</h3>
                <Plane className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {milesBalance.availableMiles.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Redeemed Miles</h3>
                <Gift className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {milesBalance.redeemedMiles.toLocaleString()}
              </p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="miles" className="gap-2">
              <Gift className="w-4 h-4" />
              Miles History
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8">
              {profile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Frequent Flyer Number
                      </label>
                      <p className="text-lg font-semibold">
                        {profile.frequentFlyerNumber || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Passport Number
                      </label>
                      <p className="text-lg font-semibold">
                        {profile.passportNumber || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </label>
                      <p className="text-lg font-semibold">
                        {user.email || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Phone Number
                      </label>
                      <p className="text-lg font-semibold">
                        {profile.phoneNumber || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Address
                      </label>
                      <p className="text-lg font-semibold">
                        {profile.address || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        City
                      </label>
                      <p className="text-lg font-semibold">
                        {profile.city || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Total Flights
                      </label>
                      <p className="text-lg font-semibold">
                        {profile.totalFlights || 0}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Total Spent
                      </label>
                      <p className="text-lg font-semibold">
                        ${parseFloat(profile.totalSpent?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      onClick={() => setLocation('/register-profile')}
                      className="gap-2"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Profile not found
                  </p>
                  <Button onClick={() => setLocation('/register-profile')}>
                    Create Profile
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Miles History Tab */}
          <TabsContent value="miles">
            <Card className="p-8">
              {milesHistory.length > 0 ? (
                <div className="space-y-4">
                  {milesHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {entry.reason}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          entry.milesChange > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {entry.milesChange > 0 ? '+' : ''}
                        {entry.milesChange.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No miles history yet
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <span className="text-sm">SMS Notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Marketing Emails</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="outline">Save Preferences</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
