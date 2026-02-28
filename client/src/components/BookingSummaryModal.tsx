import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CurrencyConverter from '@/components/CurrencyConverter';

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingData: {
    flight: {
      departure: string;
      arrival: string;
      duration: string;
      from: string;
      to: string;
      aircraft: string;
      date: string;
      flightNumber: string;
    };
    passengers: Array<{
      id: number;
      title: string;
      firstName: string;
      lastName: string;
    }>;
    selectedSeats: string[];
    baggage: number;
    mealUpgrade: boolean;
    contactEmail: string;
    contactPhone: string;
    pricing: {
      baseFare: number;
      baggageTotal: number;
      seatsTotal: number;
      mealTotal: number;
      total: number;
    };
  };
}

export default function BookingSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  bookingData,
}: BookingSummaryModalProps) {
  const { language, currency, isRTL } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'summary.title': 'Booking Summary',
        'summary.description': 'Please review your booking details before proceeding to payment',
        'summary.flight': 'Flight Details',
        'summary.passengers': 'Passengers',
        'summary.addOns': 'Add-ons & Services',
        'summary.contact': 'Contact Information',
        'summary.pricing': 'Price Breakdown',
        'summary.departure': 'Departure',
        'summary.arrival': 'Arrival',
        'summary.duration': 'Duration',
        'summary.aircraft': 'Aircraft',
        'summary.date': 'Date',
        'summary.flightNumber': 'Flight Number',
        'summary.baseFare': 'Base Fare',
        'summary.baggage': 'Baggage',
        'summary.seats': 'Seat Selection',
        'summary.meals': 'Meal Upgrade',
        'summary.total': 'Total Amount',
        'summary.email': 'Email',
        'summary.phone': 'Phone',
        'summary.confirm': 'Proceed to Payment',
        'summary.edit': 'Edit Booking',
        'summary.passenger': 'Passenger',
        'summary.noSeats': 'No seats selected',
        'summary.bagCount': 'Baggage Pieces',
      },
      ar: {
        'summary.title': 'ملخص الحجز',
        'summary.description': 'يرجى مراجعة تفاصيل حجزك قبل المتابعة إلى الدفع',
        'summary.flight': 'تفاصيل الرحلة',
        'summary.passengers': 'الركاب',
        'summary.addOns': 'الإضافات والخدمات',
        'summary.contact': 'معلومات الاتصال',
        'summary.pricing': 'تفصيل الأسعار',
        'summary.departure': 'المغادرة',
        'summary.arrival': 'الوصول',
        'summary.duration': 'المدة',
        'summary.aircraft': 'الطائرة',
        'summary.date': 'التاريخ',
        'summary.flightNumber': 'رقم الرحلة',
        'summary.baseFare': 'السعر الأساسي',
        'summary.baggage': 'الأمتعة',
        'summary.seats': 'اختيار المقاعد',
        'summary.meals': 'ترقية الوجبة',
        'summary.total': 'المبلغ الإجمالي',
        'summary.email': 'البريد الإلكتروني',
        'summary.phone': 'الهاتف',
        'summary.confirm': 'المتابعة إلى الدفع',
        'summary.edit': 'تعديل الحجز',
        'summary.passenger': 'الراكب',
        'summary.noSeats': 'لم يتم اختيار مقاعد',
        'summary.bagCount': 'عدد قطع الأمتعة',
      },
    };

    return translations[language]?.[key] || key;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('summary.title')}</DialogTitle>
          <DialogDescription>{t('summary.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Details */}
          <Card className="p-4">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('summary.flight')}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('summary.date')}</p>
                <p className="font-medium">{bookingData.flight.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('summary.flightNumber')}</p>
                <p className="font-medium">{bookingData.flight.flightNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('summary.departure')}</p>
                <p className="font-bold text-lg">
                  {bookingData.flight.departure} {bookingData.flight.from}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('summary.arrival')}</p>
                <p className="font-bold text-lg">
                  {bookingData.flight.arrival} {bookingData.flight.to}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('summary.duration')}</p>
                <p className="font-medium">{bookingData.flight.duration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('summary.aircraft')}</p>
                <p className="font-medium">{bookingData.flight.aircraft}</p>
              </div>
            </div>
          </Card>

          {/* Passengers */}
          <Card className="p-4">
            <h3 className="font-bold text-primary mb-4">{t('summary.passengers')}</h3>
            <div className="space-y-2">
              {bookingData.passengers.map((passenger, idx) => (
                <div key={passenger.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>
                    {t('summary.passenger')} {idx + 1}: {passenger.title} {passenger.firstName}{' '}
                    {passenger.lastName}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Add-ons & Services */}
          <Card className="p-4">
            <h3 className="font-bold text-primary mb-4">{t('summary.addOns')}</h3>
            <div className="space-y-3 text-sm">
              {bookingData.baggage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t('summary.bagCount')}: {bookingData.baggage}
                  </span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}
                    {bookingData.pricing.baggageTotal}
                  </span>
                </div>
              )}

              {bookingData.selectedSeats.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">
                      {t('summary.seats')}: {bookingData.selectedSeats.length}
                    </span>
                    <span className="font-medium">
                      {currency === 'USD' ? '$' : ''}
                      {bookingData.pricing.seatsTotal}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.selectedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="px-2 py-1 bg-accent/10 border border-accent text-accent text-xs rounded font-medium"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {bookingData.mealUpgrade && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('summary.meals')}</span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}
                    {bookingData.pricing.mealTotal}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-bold text-primary mb-4">{t('summary.contact')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.email')}</span>
                <span className="font-medium">{bookingData.contactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.phone')}</span>
                <span className="font-medium">{bookingData.contactPhone}</span>
              </div>
            </div>
          </Card>

          {/* Price Breakdown */}
          <Card className="p-4 bg-primary/5 border-primary">
            <h3 className="font-bold text-primary mb-4">{t('summary.pricing')}</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.baseFare')}</span>
                <span className="font-medium">
                  {currency === 'USD' ? '$' : ''}
                  {bookingData.pricing.baseFare}
                </span>
              </div>
              {bookingData.pricing.baggageTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summary.baggage')}</span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}
                    {bookingData.pricing.baggageTotal}
                  </span>
                </div>
              )}
              {bookingData.pricing.seatsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summary.seats')}</span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}
                    {bookingData.pricing.seatsTotal}
                  </span>
                </div>
              )}
              {bookingData.pricing.mealTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summary.meals')}</span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}
                    {bookingData.pricing.mealTotal}
                  </span>
                </div>
              )}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">{t('summary.total')}</span>
              <span className="text-2xl font-bold text-accent">
                {currency === 'USD' ? '$' : ''}
                {bookingData.pricing.total}
              </span>
            </div>
          </Card>

          {/* Currency Converter */}
          <CurrencyConverter
            amount={bookingData.pricing.total}
            baseCurrency={currency}
          />

          {/* Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              {language === 'en'
                ? 'Please verify all details are correct before proceeding. You will receive a confirmation email at the address provided.'
                : 'يرجى التحقق من صحة جميع التفاصيل قبل المتابعة. ستتلقى بريد تأكيد على العنوان المقدم.'}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <Edit2 className="w-4 h-4" />
            {t('summary.edit')}
          </Button>
          <Button onClick={onConfirm} className="bg-primary hover:bg-primary/90 gap-2">
            <CheckCircle className="w-4 h-4" />
            {t('summary.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
