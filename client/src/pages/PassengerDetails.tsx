import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import SeatMap from '@/components/SeatMap';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PassengerDetails() {
  const { language, currency, isRTL } = useLanguage();
  const [passengers, setPassengers] = useState([
    { id: 1, title: 'Mr', firstName: '', lastName: '', email: '', phone: '' },
  ]);
  const [baggage, setBaggage] = useState(1);
  const [seatSelection, setSeatSelection] = useState(false);
  const [mealUpgrade, setMealUpgrade] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatPrice, setSeatPrice] = useState(0);

  const handleSeatSelect = (seatId: string, price: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      setSeatPrice(seatPrice - price);
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
      setSeatPrice(seatPrice + price);
    }
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { id: passengers.length + 1, title: 'Mr', firstName: '', lastName: '', email: '', phone: '' },
    ]);
  };

  const removePassenger = (id: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p) => p.id !== id));
    }
  };

  const updatePassenger = (id: number, field: string, value: string) => {
    setPassengers(
      passengers.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const totalPrice = 89 + baggage * 25 + seatPrice + (mealUpgrade ? 10 : 0);

  return (
    <Layout>
      <div className="container py-8">
        {/* Booking Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">
                {language === 'en' ? 'Search' : 'البحث'}
              </span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium">
                {language === 'en' ? 'Passengers' : 'الركاب'}
              </span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'Payment' : 'الدفع'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Passenger Information */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en' ? 'Passenger Information' : 'معلومات الركاب'}
              </h2>

              <div className="space-y-6">
                {passengers.map((passenger, idx) => (
                  <div key={passenger.id} className="border-b border-border pb-6 last:border-b-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-primary">
                        {language === 'en' ? `Passenger ${idx + 1}` : `الراكب ${idx + 1}`}
                      </h3>
                      {passengers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePassenger(passenger.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          {language === 'en' ? 'Remove' : 'إزالة'}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'en' ? 'Title' : 'اللقب'}
                        </label>
                        <Select
                          value={passenger.title}
                          onValueChange={(value) =>
                            updatePassenger(passenger.id, 'title', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">
                              {language === 'en' ? 'Mr' : 'السيد'}
                            </SelectItem>
                            <SelectItem value="Ms">
                              {language === 'en' ? 'Ms' : 'السيدة'}
                            </SelectItem>
                            <SelectItem value="Mrs">
                              {language === 'en' ? 'Mrs' : 'السيدة'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'en' ? 'First Name' : 'الاسم الأول'}
                        </label>
                        <Input
                          value={passenger.firstName}
                          onChange={(e) =>
                            updatePassenger(passenger.id, 'firstName', e.target.value)
                          }
                          placeholder={language === 'en' ? 'First name' : 'الاسم الأول'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'en' ? 'Last Name' : 'اسم العائلة'}
                        </label>
                        <Input
                          value={passenger.lastName}
                          onChange={(e) =>
                            updatePassenger(passenger.id, 'lastName', e.target.value)
                          }
                          placeholder={language === 'en' ? 'Last name' : 'اسم العائلة'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {language === 'en' ? 'Date of Birth' : 'تاريخ الميلاد'}
                        </label>
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-6 gap-2"
                onClick={addPassenger}
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'Add Passenger' : 'إضافة راكب'}
              </Button>
            </Card>

            {/* Add-ons */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en' ? 'Add-ons & Services' : 'الخدمات الإضافية'}
              </h2>

              <div className="space-y-4">
                {/* Baggage */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/5">
                  <div>
                    <h3 className="font-bold text-foreground">
                      {language === 'en' ? 'Extra Baggage' : 'أمتعة إضافية'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? '23kg per piece' : '23 كجم لكل قطعة'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent">
                      {currency === 'USD' ? '$' : ''}25
                    </span>
                    <div className="flex items-center gap-2 bg-secondary rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBaggage(Math.max(1, baggage - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{baggage}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBaggage(baggage + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Seat Selection - Interactive Seat Map */}
                <SeatMap onSeatSelect={handleSeatSelect} selectedSeats={selectedSeats} />

                {/* Meal Upgrade */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/5">
                  <div>
                    <h3 className="font-bold text-foreground">
                      {language === 'en' ? 'Meal Upgrade' : 'ترقية الوجبة'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'Premium meal service'
                        : 'خدمة وجبات متميزة'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent">
                      {currency === 'USD' ? '$' : ''}10
                    </span>
                    <Checkbox
                      checked={mealUpgrade}
                      onCheckedChange={(checked) =>
                        setMealUpgrade(checked as boolean)
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en' ? 'Contact Information' : 'معلومات الاتصال'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={language === 'en' ? 'your@email.com' : 'بريدك@البريد.com'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'en' ? 'Phone' : 'الهاتف'}
                  </label>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder={language === 'en' ? '+1 (555) 000-0000' : '+962 6 445 5555'}
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  {language === 'en'
                    ? 'We will send your booking confirmation and updates to this email'
                    : 'سنرسل تأكيد حجزك والتحديثات إلى هذا البريد الإلكتروني'}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-bold text-primary mb-4">
                {language === 'en' ? 'Price Summary' : 'ملخص السعر'}
              </h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Flight (1x)' : 'الرحلة (1x)'}
                  </span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}89
                  </span>
                </div>
                {baggage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'en' ? `Baggage (${baggage}x)` : `الأمتعة (${baggage}x)`}
                    </span>
                    <span className="font-medium">
                      {currency === 'USD' ? '$' : ''}{baggage * 25}
                    </span>
                  </div>
                )}
                {seatPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'en' ? `Seats (${selectedSeats.length}x)` : `مقاعد (${selectedSeats.length}x)`}
                    </span>
                    <span className="font-medium">
                      {currency === 'USD' ? '$' : ''}{seatPrice}
                    </span>
                  </div>
                )}
                {mealUpgrade && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Meal Upgrade' : 'ترقية الوجبة'}
                    </span>
                    <span className="font-medium">
                      {currency === 'USD' ? '$' : ''}10
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-foreground">
                  {language === 'en' ? 'Total' : 'الإجمالي'}
                </span>
                <span className="text-2xl font-bold text-accent">
                  {currency === 'USD' ? '$' : ''}{totalPrice}
                </span>
              </div>

              <Link href="/payment">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-2">
                  {language === 'en' ? 'Continue to Payment' : 'المتابعة إلى الدفع'}
                </Button>
              </Link>

              <Button variant="outline" className="w-full">
                {language === 'en' ? 'Save for Later' : 'احفظ للاحقاً'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
