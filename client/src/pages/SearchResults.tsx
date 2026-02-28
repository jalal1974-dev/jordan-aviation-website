import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronDown, Filter, MapPin, Clock, Users, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const flightResults = [
  {
    id: 1,
    airline: 'Jordan Aviation',
    departure: '08:00',
    arrival: '11:30',
    duration: '3h 30m',
    stops: 0,
    from: 'AMM',
    to: 'CAI',
    aircraft: 'Boeing 737-300',
    seats: 12,
    basicPrice: 89,
    smartPrice: 129,
    flexPrice: 189,
    onTime: 98,
  },
  {
    id: 2,
    airline: 'Jordan Aviation',
    departure: '14:00',
    arrival: '17:45',
    duration: '3h 45m',
    stops: 0,
    from: 'AMM',
    to: 'CAI',
    aircraft: 'Airbus A320-200',
    seats: 8,
    basicPrice: 95,
    smartPrice: 135,
    flexPrice: 195,
    onTime: 96,
  },
  {
    id: 3,
    airline: 'Jordan Aviation',
    departure: '20:30',
    arrival: '00:15',
    duration: '3h 45m',
    stops: 0,
    from: 'AMM',
    to: 'CAI',
    aircraft: 'Boeing 767-200',
    seats: 5,
    basicPrice: 79,
    smartPrice: 119,
    flexPrice: 179,
    onTime: 99,
  },
];

const bundles = [
  {
    name: 'Basic',
    nameAr: 'أساسي',
    includes: ['Checked baggage (1x 20kg)', 'Standard seat', 'In-flight beverage'],
    includesAr: ['أمتعة مسجلة (1x 20 كجم)', 'مقعد قياسي', 'مشروب أثناء الرحلة'],
  },
  {
    name: 'Smart',
    nameAr: 'ذكي',
    includes: ['Checked baggage (2x 23kg)', 'Preferred seat', 'Meal service', 'Priority boarding'],
    includesAr: ['أمتعة مسجلة (2x 23 كجم)', 'مقعد مفضل', 'خدمة الوجبات', 'الصعود الأولوي'],
    featured: true,
  },
  {
    name: 'Flex',
    nameAr: 'مرن',
    includes: ['Checked baggage (3x 23kg)', 'Premium seat', 'Full meal service', 'Priority boarding', 'Free changes'],
    includesAr: ['أمتعة مسجلة (3x 23 كجم)', 'مقعد متميز', 'خدمة وجبات كاملة', 'الصعود الأولوي', 'تغييرات مجانية'],
  },
];

export default function SearchResults() {
  const { language, currency, isRTL } = useLanguage();
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState([79, 195]);
  const [stops, setStops] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

  const filteredFlights = flightResults.filter((flight) => {
    const price = flight.basicPrice;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    if (stops !== null && flight.stops !== stops) return false;
    return true;
  });

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Flight Results' : 'نتائج الرحلات'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? `Amman (AMM) → Cairo (CAI) • March 2, 2026 • 1 Passenger`
              : `عمّان (AMM) → القاهرة (CAI) • 2 مارس 2026 • راكب واحد`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border p-6 sticky top-20">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {language === 'en' ? 'Filters' : 'المرشحات'}
              </h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  {language === 'en' ? 'Price Range' : 'نطاق السعر'}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={50}
                  max={250}
                  step={5}
                  className="mb-2"
                />
                <div className="text-xs text-muted-foreground">
                  {currency === 'USD' ? '$' : ''}{priceRange[0]} - {currency === 'USD' ? '$' : ''}{priceRange[1]}
                </div>
              </div>

              {/* Stops */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  {language === 'en' ? 'Stops' : 'التوقفات'}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 0, label: language === 'en' ? 'Non-stop' : 'بدون توقف' },
                    { value: 1, label: language === 'en' ? '1 Stop' : 'توقف واحد' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`stops-${option.value}`}
                        checked={stops === option.value}
                        onCheckedChange={(checked) =>
                          setStops(checked ? option.value : null)
                        }
                      />
                      <label
                        htmlFor={`stops-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departure Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  {language === 'en' ? 'Departure Time' : 'وقت المغادرة'}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'morning', label: language === 'en' ? 'Morning (6-12)' : 'الصباح (6-12)' },
                    { value: 'afternoon', label: language === 'en' ? 'Afternoon (12-18)' : 'بعد الظهر (12-18)' },
                    { value: 'evening', label: language === 'en' ? 'Evening (18-24)' : 'المساء (18-24)' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`time-${option.value}`}
                        checked={timeFilter === option.value}
                        onCheckedChange={(checked) =>
                          setTimeFilter(checked ? option.value : null)
                        }
                      />
                      <label
                        htmlFor={`time-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full">
                {language === 'en' ? 'Reset Filters' : 'إعادة تعيين المرشحات'}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Fare Bundles Info */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {bundles.map((bundle, idx) => (
                <Card
                  key={idx}
                  className={`p-4 ${bundle.featured ? 'border-accent border-2 bg-accent/5' : ''}`}
                >
                  <h4 className="font-bold text-primary mb-2">
                    {language === 'en' ? bundle.name : bundle.nameAr}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    {(language === 'en' ? bundle.includes : bundle.includesAr).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                  {bundle.featured && (
                    <div className="text-xs font-semibold text-accent">
                      {language === 'en' ? 'Best Value' : 'أفضل قيمة'}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Flight Results */}
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <Card
                  key={flight.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedFlight === flight.id ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => setSelectedFlight(flight.id)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-4">
                    {/* Flight Time */}
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {flight.departure}
                      </div>
                      <div className="text-xs text-muted-foreground">{flight.from}</div>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        {flight.duration}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1 h-px bg-border"></div>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {flight.stops === 0
                          ? language === 'en'
                            ? 'Non-stop'
                            : 'بدون توقف'
                          : `${flight.stops} ${language === 'en' ? 'stop' : 'توقف'}`}
                      </div>
                    </div>

                    {/* Arrival Time */}
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {flight.arrival}
                      </div>
                      <div className="text-xs text-muted-foreground">{flight.to}</div>
                    </div>

                    {/* Aircraft & On-time */}
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">{flight.aircraft}</div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <AlertCircle className="w-3 h-3" />
                        {flight.onTime}% {language === 'en' ? 'on-time' : 'في الموعد'}
                      </div>
                    </div>

                    {/* Price & Select */}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-2">
                        {language === 'en' ? 'from' : 'من'}
                      </div>
                      <div className="text-2xl font-bold text-accent mb-3">
                        {currency === 'USD' ? '$' : ''}{flight.basicPrice}
                      </div>
                      <Link href="/passenger-details">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          {language === 'en' ? 'Select' : 'اختر'}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Urgency Message */}
                  {flight.seats < 10 && (
                    <div className="bg-accent/10 border border-accent rounded p-2 text-xs text-accent font-medium">
                      {language === 'en'
                        ? `Only ${flight.seats} seats left at this fare`
                        : `${flight.seats} مقاعد فقط متبقية بهذا السعر`}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filteredFlights.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {language === 'en'
                    ? 'No flights found matching your criteria'
                    : 'لم يتم العثور على رحلات تطابق معاييرك'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
