import { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, DollarSign, Zap, Download, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BookingHistoryDashboard() {
  const { user } = useAuth();
  const { language, currency } = useLanguage();
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'milesEarned' | 'pointsEarned'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);

  const limit = 10;

  // Fetch booking history
  const { data: bookingHistory, isLoading } = trpc.bookingHistory.getBookingHistory.useQuery({
    limit,
    offset: page * limit,
    sortBy: sortBy as any,
    sortOrder,
    dateFrom,
    dateTo,
    status: status as any,
    searchQuery: searchQuery || undefined,
  });

  // Fetch statistics
  const { data: statistics } = trpc.bookingHistory.getBookingStatistics.useQuery();

  // Fetch booking detail
  const { data: bookingDetail } = trpc.bookingHistory.getBookingDetail.useQuery(
    { bookingId: selectedBooking! },
    { enabled: selectedBooking !== null }
  );

  const totalPages = bookingHistory ? Math.ceil(bookingHistory.total / limit) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {language === 'en' ? 'Booking History' : 'سجل الحجوزات'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Track your past flights, miles earned, and loyalty points'
              : 'تتبع رحلاتك السابقة والأميال المكتسبة ونقاط الولاء'}
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Bookings' : 'إجمالي الحجوزات'}
                  </p>
                  <p className="text-3xl font-bold text-primary">{statistics.totalBookings}</p>
                </div>
                <Users className="w-8 h-8 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Miles' : 'إجمالي الأميال'}
                  </p>
                  <p className="text-3xl font-bold text-amber-600">{statistics.totalMilesEarned.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-amber-600/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Points' : 'إجمالي النقاط'}
                  </p>
                  <p className="text-3xl font-bold text-accent">{statistics.totalPointsEarned.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-accent/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Spent' : 'إجمالي الإنفاق'}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {currency === 'USD' ? '$' : ''}{statistics.totalSpent.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Avg Booking' : 'متوسط الحجز'}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {currency === 'USD' ? '$' : ''}{statistics.averageBookingValue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600/20" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {language === 'en' ? 'Filters & Search' : 'المرشحات والبحث'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'en' ? 'Search booking...' : 'ابحث عن الحجز...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="pl-10"
              />
            </div>

            {/* Date From */}
            <Input
              type="date"
              value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                setDateFrom(e.target.value ? new Date(e.target.value) : undefined);
                setPage(0);
              }}
            />

            {/* Date To */}
            <Input
              type="date"
              value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                setDateTo(e.target.value ? new Date(e.target.value) : undefined);
                setPage(0);
              }}
            />

            {/* Status Filter */}
            <Select value={status} onValueChange={(val) => {
              setStatus(val);
              setPage(0);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'en' ? 'All Status' : 'جميع الحالات'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{language === 'en' ? 'Date' : 'التاريخ'}</SelectItem>
                <SelectItem value="price">{language === 'en' ? 'Price' : 'السعر'}</SelectItem>
                <SelectItem value="milesEarned">{language === 'en' ? 'Miles' : 'الأميال'}</SelectItem>
                <SelectItem value="pointsEarned">{language === 'en' ? 'Points' : 'النقاط'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bookings Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              {language === 'en' ? 'Loading bookings...' : 'جاري تحميل الحجوزات...'}
            </div>
          ) : bookingHistory?.bookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {language === 'en' ? 'No bookings found' : 'لم يتم العثور على حجوزات'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Reference' : 'المرجع'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Route' : 'الطريق'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Date' : 'التاريخ'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Price' : 'السعر'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Miles' : 'الأميال'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Points' : 'النقاط'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {language === 'en' ? 'Status' : 'الحالة'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingHistory?.bookings.map((booking: any) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedBooking(booking.id)}
                      >
                        <td className="px-6 py-4 text-sm font-mono text-primary">
                          {booking.bookingReference}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {booking.departureAirport} → {booking.arrivalAirport}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(booking.departureDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {currency === 'USD' ? '$' : ''}{parseFloat(booking.totalPrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-amber-600 font-semibold">
                          {booking.milesEarned || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-accent font-semibold">
                          {booking.pointsEarned || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {language === 'en'
                    ? `Showing ${page * limit + 1} to ${Math.min((page + 1) * limit, bookingHistory?.total || 0)} of ${bookingHistory?.total || 0}`
                    : `عرض ${page * limit + 1} إلى ${Math.min((page + 1) * limit, bookingHistory?.total || 0)} من ${bookingHistory?.total || 0}`}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    {language === 'en' ? 'Previous' : 'السابق'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    {language === 'en' ? 'Next' : 'التالي'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Booking Detail Modal */}
        {selectedBooking && bookingDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">
                  {language === 'en' ? 'Booking Details' : 'تفاصيل الحجز'}
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Flight Info */}
                <div>
                  <h3 className="font-semibold text-primary mb-3">
                    {language === 'en' ? 'Flight Information' : 'معلومات الرحلة'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'Flight Number' : 'رقم الرحلة'}
                      </p>
                      <p className="font-semibold">{bookingDetail.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'Route' : 'الطريق'}
                      </p>
                      <p className="font-semibold">
                        {bookingDetail.departureAirport} → {bookingDetail.arrivalAirport}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'Departure' : 'المغادرة'}
                      </p>
                      <p className="font-semibold">
                        {new Date(bookingDetail.departureDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'Passengers' : 'الركاب'}
                      </p>
                      <p className="font-semibold">{bookingDetail.numberOfPassengers}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="font-semibold text-primary mb-3">
                    {language === 'en' ? 'Pricing' : 'التسعير'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Base Fare' : 'السعر الأساسي'}
                      </span>
                      <span className="font-semibold">
                        {currency === 'USD' ? '$' : ''}{parseFloat(bookingDetail.totalPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">
                        {language === 'en' ? 'Total' : 'الإجمالي'}
                      </span>
                      <span className="font-bold text-lg">
                        {currency === 'USD' ? '$' : ''}{parseFloat(bookingDetail.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rewards */}
                {bookingDetail.milesPoints && (
                  <div>
                    <h3 className="font-semibold text-primary mb-3">
                      {language === 'en' ? 'Rewards Earned' : 'المكافآت المكتسبة'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {language === 'en' ? 'Miles' : 'الأميال'}
                        </p>
                        <p className="text-2xl font-bold text-amber-600">
                          {bookingDetail.milesPoints.milesEarned}
                        </p>
                      </div>
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {language === 'en' ? 'Points' : 'النقاط'}
                        </p>
                        <p className="text-2xl font-bold text-accent">
                          {bookingDetail.milesPoints.pointsEarned}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    {language === 'en' ? 'Download Receipt' : 'تحميل الإيصال'}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    {language === 'en' ? 'View E-Ticket' : 'عرض التذكرة الإلكترونية'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
