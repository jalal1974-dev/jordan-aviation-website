import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, MapPin, Calendar, Users, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ManageBooking() {
  const { language, currency } = useLanguage();
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [bookingFound, setBookingFound] = useState(false);

  const handleSearch = () => {
    setSearchAttempted(true);
    if (pnr === 'ABC123' && lastName === 'Doe') {
      setBookingFound(true);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Manage Your Booking' : 'إدارة حجزك'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'en'
              ? 'Enter your booking reference and last name to view and manage your reservation'
              : 'أدخل رقم مرجع حجزك واسم العائلة لعرض وإدارة حجزك'}
          </p>

          {!bookingFound ? (
            <Card className="p-8">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'en' ? 'Booking Reference (PNR)' : 'رقم مرجع الحجز'}
                  </label>
                  <Input
                    placeholder={language === 'en' ? 'e.g., ABC123' : 'مثال: ABC123'}
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en'
                      ? 'Try: ABC123'
                      : 'جرب: ABC123'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'en' ? 'Last Name' : 'اسم العائلة'}
                  </label>
                  <Input
                    placeholder={language === 'en' ? 'Last name' : 'اسم العائلة'}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en'
                      ? 'Try: Doe'
                      : 'جرب: Doe'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {language === 'en' ? 'Find My Booking' : 'ابحث عن حجزي'}
              </Button>

              {searchAttempted && !bookingFound && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    {language === 'en'
                      ? 'Booking not found. Please check your reference and name.'
                      : 'لم يتم العثور على الحجز. يرجى التحقق من مرجعك واسمك.'}
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Booking Summary */}
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {language === 'en' ? 'Your Booking' : 'حجزك'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Reference: ABC123' : 'المرجع: ABC123'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <Check className="w-4 h-4" />
                      {language === 'en' ? 'Confirmed' : 'مؤكد'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Route' : 'الطريق'}
                      </p>
                      <p className="font-bold text-foreground">AMM → CAI</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Departure' : 'المغادرة'}
                      </p>
                      <p className="font-bold text-foreground">
                        {language === 'en' ? 'March 2, 2026 • 08:00' : '2 مارس 2026 • 08:00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Passengers' : 'الركاب'}
                      </p>
                      <p className="font-bold text-foreground">John Doe</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'Total Paid' : 'المبلغ المدفوع'}
                    </p>
                    <p className="font-bold text-primary text-lg">
                      {currency === 'USD' ? '$' : ''}124
                    </p>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <p className="font-bold text-foreground">
                      {language === 'en' ? 'Change Date' : 'تغيير التاريخ'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en'
                        ? 'Modify your flight date'
                        : 'عدّل تاريخ رحلتك'}
                    </p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <p className="font-bold text-foreground">
                      {language === 'en' ? 'Add Baggage' : 'إضافة أمتعة'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en'
                        ? 'Purchase extra baggage'
                        : 'شراء أمتعة إضافية'}
                    </p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <p className="font-bold text-foreground">
                      {language === 'en' ? 'Select Seat' : 'اختيار المقعد'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en'
                        ? 'Choose your preferred seat'
                        : 'اختر مقعدك المفضل'}
                    </p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <p className="font-bold text-foreground">
                      {language === 'en' ? 'Update Contact' : 'تحديث جهات الاتصال'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en'
                        ? 'Modify your contact details'
                        : 'عدّل معلومات الاتصال الخاصة بك'}
                    </p>
                  </div>
                </Button>
              </div>

              {/* Cancellation */}
              <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="font-bold text-foreground mb-2">
                  {language === 'en' ? 'Cancellation & Refund' : 'الإلغاء والاسترداد'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'en'
                    ? 'This booking is eligible for a full refund if cancelled 48 hours before departure.'
                    : 'هذا الحجز مؤهل للحصول على استرجاع كامل إذا تم إلغاؤه قبل 48 ساعة من المغادرة.'}
                </p>
                <Button variant="destructive">
                  {language === 'en' ? 'Request Cancellation' : 'طلب الإلغاء'}
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
