import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Seat {
  id: string;
  row: number;
  column: string;
  status: 'available' | 'occupied' | 'selected';
  price?: number;
}

interface SeatMapProps {
  onSeatSelect: (seatId: string, price: number) => void;
  selectedSeats: string[];
}

export default function SeatMap({ onSeatSelect, selectedSeats }: SeatMapProps) {
  const { language, currency } = useLanguage();
  const [seats, setSeats] = useState<Seat[]>(() => {
    const generatedSeats: Seat[] = [];
    const rows = 20;
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (let row = 1; row <= rows; row++) {
      for (const col of columns) {
        const seatId = `${row}${col}`;
        // Randomly mark some seats as occupied
        const isOccupied = Math.random() < 0.3;
        // Premium seats (rows 1-3 and aisle seats A/F) are more expensive
        const isPremium = row <= 3 || col === 'A' || col === 'F';

        generatedSeats.push({
          id: seatId,
          row,
          column: col,
          status: isOccupied ? 'occupied' : 'available',
          price: isPremium ? 25 : 15,
        });
      }
    }
    return generatedSeats;
  });

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    const isSelected = selectedSeats.includes(seat.id);

    if (isSelected) {
      // Deselect seat
      onSeatSelect(seat.id, 0);
      setSeats(
        seats.map((s) =>
          s.id === seat.id ? { ...s, status: 'available' } : s
        )
      );
    } else {
      // Select seat
      onSeatSelect(seat.id, seat.price || 0);
      setSeats(
        seats.map((s) =>
          s.id === seat.id ? { ...s, status: 'selected' } : s
        )
      );
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'occupied') return 'bg-gray-300 cursor-not-allowed';
    if (selectedSeats.includes(seat.id)) return 'bg-accent hover:bg-accent/90';
    if (seat.row <= 3 || seat.column === 'A' || seat.column === 'F') {
      return 'bg-amber-100 hover:bg-amber-200 cursor-pointer';
    }
    return 'bg-green-100 hover:bg-green-200 cursor-pointer';
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const selectedSeatDetails = seats.filter((s) =>
    selectedSeats.includes(s.id)
  );
  const totalSeatPrice = selectedSeatDetails.reduce(
    (sum, s) => sum + (s.price || 0),
    0
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-primary mb-4">
          {language === 'en' ? 'Select Your Seats' : 'اختر مقاعدك'}
        </h3>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-muted-foreground">
              {language === 'en' ? 'Standard' : 'قياسي'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-100 border border-amber-300 rounded"></div>
            <span className="text-muted-foreground">
              {language === 'en' ? 'Premium' : 'متميز'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 border border-gray-400 rounded"></div>
            <span className="text-muted-foreground">
              {language === 'en' ? 'Occupied' : 'محجوز'}
            </span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-6 rounded-lg overflow-x-auto">
          <div className="inline-block">
            {/* Column Headers */}
            <div className="flex gap-2 mb-4 ml-8">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((col) => (
                <div
                  key={col}
                  className="w-8 h-8 flex items-center justify-center font-bold text-sm text-primary"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Object.entries(groupedSeats).map(([rowNum, rowSeats]) => (
              <div key={rowNum} className="flex gap-2 mb-2 items-center">
                <div className="w-8 text-right font-bold text-sm text-primary">
                  {rowNum}
                </div>
                <div className="flex gap-2">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status === 'occupied'}
                      className={`w-8 h-8 rounded border-2 border-gray-300 transition-all ${getSeatColor(
                        seat
                      )}`}
                      title={`${seat.id} - ${
                        seat.status === 'occupied'
                          ? language === 'en'
                            ? 'Occupied'
                            : 'محجوز'
                          : `${currency === 'USD' ? '$' : ''}${seat.price}`
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {seat.column}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cabin Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-muted-foreground">
          {language === 'en'
            ? 'Premium seats in rows 1-3 and aisle seats offer extra legroom and priority boarding.'
            : 'المقاعد المتميزة في الصفوف 1-3 والمقاعد الممشى توفر مساحة إضافية والصعود الأولوي.'}
        </div>
      </Card>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card className="p-6 bg-accent/5 border-accent">
          <h4 className="font-bold text-primary mb-3">
            {language === 'en' ? 'Selected Seats' : 'المقاعد المختارة'}
          </h4>
          <div className="space-y-2 mb-4">
            {selectedSeatDetails.map((seat) => (
              <div
                key={seat.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-medium text-primary">{seat.id}</span>
                <span className="text-muted-foreground">
                  {currency === 'USD' ? '$' : ''}
                  {seat.price}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-accent pt-3 flex justify-between items-center font-bold">
            <span>{language === 'en' ? 'Seat Total' : 'إجمالي المقاعد'}</span>
            <span className="text-accent text-lg">
              {currency === 'USD' ? '$' : ''}
              {totalSeatPrice}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
