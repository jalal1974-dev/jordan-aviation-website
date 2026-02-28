import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, MapPin, Plane } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FlightStatus() {
  const { language } = useLanguage();
  const [flightNumber, setFlightNumber] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [flightFound, setFlightFound] = useState(false);

  const handleSearch = () => {
    setSearchAttempted(true);
    if (flightNumber === 'JA101' && searchDate) {
      setFlightFound(true);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Flight Status' : 'حالة الرحلة'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'en'
              ? 'Check the status of your flight in real-time'
              : 'تحقق من حالة رحلتك في الوقت الفعلي'}
          </p>

          {/* Search Form */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'Flight Number' : 'رقم الرحلة'}
                </label>
                <Input
                  placeholder={language === 'en' ? 'e.g., JA101' : 'مثال: JA101'}
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Try: JA101' : 'جرب: JA101'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'en' ? 'Date' : 'التاريخ'}
                </label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {language === 'en' ? 'Search' : 'بحث'}
                </Button>
              </div>
            </div>

            {searchAttempted && !flightFound && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  {language === 'en'
                    ? 'Flight not found. Please check the flight number and date.'
                    : 'لم يتم العثور على الرحلة. يرجى التحقق من رقم الرحلة والتاريخ.'}
                </p>
              </div>
            )}
          </Card>

          {flightFound && (
            <div className="space-y-6">
              {/* Flight Header */}
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">JA101</h2>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'Boeing 737-300 • March 2, 2026'
                        : 'بوينج 737-300 • 2 مارس 2026'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {language === 'en' ? 'On Time' : 'في الموعد'}
                  </div>
                </div>

                {/* Flight Route */}
                <div className="flex items-center justify-between my-8">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {language === 'en' ? 'Departure' : 'المغادرة'}
                    </p>
                    <p className="text-2xl font-bold text-primary">08:00</p>
                    <p className="text-sm font-medium text-foreground">Amman (AMM)</p>
                    <p className="text-xs text-muted-foreground">Terminal 1</p>
                  </div>

                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <Plane className="w-5 h-5 text-primary" />
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {language === 'en' ? '3h 30m' : '3 ساعات 30 دقيقة'}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {language === 'en' ? 'Arrival' : 'الوصول'}
                    </p>
                    <p className="text-2xl font-bold text-primary">11:30</p>
                    <p className="text-sm font-medium text-foreground">Cairo (CAI)</p>
                    <p className="text-xs text-muted-foreground">Terminal 3</p>
                  </div>
                </div>
              </Card>

              {/* Flight Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-bold text-primary mb-4">
                    {language === 'en' ? 'Aircraft' : 'الطائرة'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Type' : 'النوع'}
                      </span>
                      <span className="font-medium">Boeing 737-300</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Registration' : 'التسجيل'}
                      </span>
                      <span className="font-medium">JY-JAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Capacity' : 'السعة'}
                      </span>
                      <span className="font-medium">144 Seats</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-primary mb-4">
                    {language === 'en' ? 'On-Time Performance' : 'الالتزام بالمواعيد'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'This Route' : 'هذا الطريق'}
                      </span>
                      <span className="font-medium text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'This Month' : 'هذا الشهر'}
                      </span>
                      <span className="font-medium text-green-600">96%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'This Year' : 'هذا العام'}
                      </span>
                      <span className="font-medium text-green-600">97%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Status Timeline */}
              <Card className="p-6">
                <h3 className="font-bold text-primary mb-6">
                  {language === 'en' ? 'Flight Timeline' : 'جدول الرحلة'}
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      status: language === 'en' ? 'Boarding' : 'الصعود',
                      time: '07:45',
                      completed: true,
                    },
                    {
                      status: language === 'en' ? 'Departure' : 'المغادرة',
                      time: '08:00',
                      completed: true,
                    },
                    {
                      status: language === 'en' ? 'In Flight' : 'في الرحلة',
                      time: '08:30 - 11:00',
                      completed: false,
                      current: true,
                    },
                    {
                      status: language === 'en' ? 'Arrival' : 'الوصول',
                      time: '11:30',
                      completed: false,
                    },
                  ].map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            event.completed
                              ? 'bg-green-600 border-green-600'
                              : event.current
                              ? 'bg-accent border-accent'
                              : 'bg-white border-border'
                          }`}
                        ></div>
                        {idx < 3 && (
                          <div
                            className={`w-0.5 h-12 ${
                              event.completed ? 'bg-green-600' : 'bg-border'
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-foreground">{event.status}</p>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Safety Info */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-primary mb-2">
                  {language === 'en' ? 'Safety & Compliance' : 'السلامة والامتثال'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en'
                    ? 'Jordan Aviation maintains the highest safety standards. All aircraft are regularly maintained and certified for international operations.'
                    : 'تحافظ الأردنية للطيران على أعلى معايير السلامة. تتم صيانة جميع الطائرات بانتظام والحصول على شهادات للعمليات الدولية.'}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
