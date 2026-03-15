import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Plane, Award, TrendingUp, Download, Home } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export default function BookingConfirmation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Get booking ID from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('bookingId');
    if (id) {
      setBookingId(parseInt(id));
    }
  }, []);

  // Fetch booking details
  const { data: booking, isLoading } = trpc.booking.getBooking.useQuery(
    { bookingId: bookingId || 0 },
    { enabled: !!bookingId }
  );

  if (!user) {
    setLocation('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Booking not found</p>
            <Button onClick={() => setLocation('/')} variant="outline">
              Return to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const milesPoints = booking.milesPoints;
  const totalEarned = (milesPoints?.milesEarned || 0) + (milesPoints?.pointsEarned || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8">
      <div className="container max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your flight booking has been successfully confirmed</p>
        </div>

        {/* Booking Reference */}
        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-primary font-mono">{booking.bookingReference}</p>
            <p className="text-xs text-muted-foreground mt-2">Save this reference for your records</p>
          </div>
        </Card>

        {/* Flight Details */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Flight Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-lg font-semibold">{booking.departureAirport}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="text-lg font-semibold">{booking.arrivalAirport}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Flight Number</p>
              <p className="font-semibold">{booking.flightNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cabin Class</p>
              <p className="font-semibold capitalize">{booking.cabinClass}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Departure</p>
              <p className="font-semibold">{new Date(booking.departureDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passengers</p>
              <p className="font-semibold">{booking.numberOfPassengers}</p>
            </div>
          </div>
        </Card>

        {/* Pricing Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Pricing Summary</h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Fare</span>
              <span className="font-semibold">{booking.currency} {parseFloat(booking.baseFare.toString()).toFixed(2)}</span>
            </div>
            {booking.taxes && parseFloat(booking.taxes.toString()) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-semibold">{booking.currency} {parseFloat(booking.taxes.toString()).toFixed(2)}</span>
              </div>
            )}
            {booking.addOnsTotal && parseFloat(booking.addOnsTotal.toString()) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Add-ons</span>
                <span className="font-semibold">{booking.currency} {parseFloat(booking.addOnsTotal.toString()).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">{booking.currency} {parseFloat(booking.totalPrice.toString()).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Miles & Points Earned */}
        {milesPoints && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold">Rewards Earned</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="text-sm text-muted-foreground mb-1">Miles Earned</p>
                <p className="text-3xl font-bold text-amber-600">{milesPoints.milesEarned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {milesPoints.distance} km × {parseFloat(milesPoints.milesMultiplier.toString()).toFixed(2)}x
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="text-sm text-muted-foreground mb-1">Loyalty Points</p>
                <p className="text-3xl font-bold text-amber-600">{milesPoints.pointsEarned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {booking.currency} {parseFloat(booking.baseFare.toString()).toFixed(0)} × {parseFloat(milesPoints.pointsMultiplier.toString()).toFixed(2)}x
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <p className="text-sm">
                  <span className="font-semibold text-amber-600">{totalEarned.toLocaleString()}</span>
                  <span className="text-muted-foreground"> total rewards earned on this booking</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => setLocation('/profile')}
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            <Award className="w-4 h-4" />
            View My Rewards
          </Button>

          <Button
            onClick={() => {
              // In production, this would trigger email download
              alert('Confirmation email has been sent to your registered email address');
            }}
            variant="outline"
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            Download Confirmation
          </Button>

          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="w-full gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Additional Info */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Tip:</span> Your miles and points have been automatically added to your account. 
            You can view them in your profile and use them for future bookings!
          </p>
        </Card>
      </div>
    </div>
  );
}
