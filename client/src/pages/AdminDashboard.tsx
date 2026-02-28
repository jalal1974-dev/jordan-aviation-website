import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Edit2, Trash2, Eye, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  // Queries
  const bookingsQuery = trpc.admin.bookings.list.useQuery({ limit: 20 });
  const offersQuery = trpc.admin.offers.list.useQuery({ limit: 20 });
  const flightsQuery = trpc.admin.flights.list.useQuery({ limit: 20 });
  const bookingStatsQuery = trpc.admin.bookings.stats.useQuery();

  // Mutations
  const updateBookingStatusMutation = trpc.admin.bookings.updateStatus.useMutation();
  const createOfferMutation = trpc.admin.offers.create.useMutation();
  const updateOfferMutation = trpc.admin.offers.update.useMutation();
  const deleteOfferMutation = trpc.admin.offers.delete.useMutation();

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    try {
      await updateBookingStatusMutation.mutateAsync({
        id,
        status: status as any,
      });
      bookingsQuery.refetch();
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings, offers, and website content</p>
          </div>
        </div>

        {/* Stats Cards */}
        {bookingStatsQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {bookingStatsQuery.data.map((stat: any) => (
              <Card key={stat.status}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize text-muted-foreground">
                    {stat.status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stat.count || 0}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsQuery.isLoading ? (
                  <div className="text-center py-8">Loading bookings...</div>
                ) : bookingsQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No bookings found</div>
                ) : (
                  <div className="space-y-4">
                    {bookingsQuery.data?.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/5"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">
                            {booking.bookingReference}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.departureAirport} → {booking.arrivalAirport} • {booking.numberOfPassengers} passengers
                          </div>
                          <div className="text-sm mt-1">
                            Total: ${booking.totalPrice} {booking.currency}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              booking.status === 'confirmed'
                                ? 'default'
                                : booking.status === 'cancelled'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {booking.status}
                          </Badge>

                          <Select
                            defaultValue={booking.status}
                            onValueChange={(value) =>
                              handleUpdateBookingStatus(booking.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBookingId(booking.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* OFFERS TAB */}
          <TabsContent value="offers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Manage Offers</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Offer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Offer</DialogTitle>
                  </DialogHeader>
                  <CreateOfferForm
                    onSuccess={() => {
                      offersQuery.refetch();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {offersQuery.isLoading ? (
                  <div className="text-center py-8">Loading offers...</div>
                ) : offersQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No offers found</div>
                ) : (
                  <div className="space-y-4">
                    {offersQuery.data?.map((offer: any) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/5"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{offer.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Code: {offer.code}
                          </div>
                          <div className="text-sm mt-1">
                            {offer.discountType === 'percentage'
                              ? `${offer.discountValue}% off`
                              : `$${offer.discountValue} off`}{' '}
                            • Usage: {offer.currentUsage}/{offer.maxUsage || '∞'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                            {offer.isActive ? 'Active' : 'Inactive'}
                          </Badge>

                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteOfferMutation.mutate({ id: offer.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FLIGHTS TAB */}
          <TabsContent value="flights" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Manage Flights</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Flight
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {flightsQuery.isLoading ? (
                  <div className="text-center py-8">Loading flights...</div>
                ) : flightsQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No flights found</div>
                ) : (
                  <div className="space-y-4">
                    {flightsQuery.data?.map((flight: any) => (
                      <div
                        key={flight.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/5"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{flight.flightNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {flight.departureAirport} → {flight.arrivalAirport}
                          </div>
                          <div className="text-sm mt-1">
                            Seats: {flight.availableSeats}/{flight.totalSeats} available
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={flight.isActive ? 'default' : 'secondary'}>
                            {flight.isActive ? 'Active' : 'Inactive'}
                          </Badge>

                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Website Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Settings management allows you to update website content, messages, and configuration without code changes.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Website Title</label>
                    <Input placeholder="Jordan Aviation" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Support Email</label>
                    <Input type="email" placeholder="support@jordanaviation.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Support Phone</label>
                    <Input placeholder="+962 6 5555 445" />
                  </div>

                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Create Offer Form Component
function CreateOfferForm({ onSuccess }: { onSuccess: () => void }) {
  const createMutation = trpc.admin.offers.create.useMutation();
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    code: '',
    discountType: 'percentage' as const,
    discountValue: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title (English)</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title (Arabic)</label>
        <Input
          value={formData.titleAr}
          onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Code</label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="SAVE20"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select
            value={formData.discountType}
            onValueChange={(value: any) =>
              setFormData({ ...formData, discountType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Value</label>
          <Input
            type="number"
            value={formData.discountValue}
            onChange={(e) =>
              setFormData({ ...formData, discountValue: parseFloat(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Offer
      </Button>
    </form>
  );
}
