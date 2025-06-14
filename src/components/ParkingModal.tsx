
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Parking } from "@/data/parkings";
import { CircleParking, Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import ruLocale from "date-fns/locale/ru";

const BOOKINGS_LS_KEY = "bookings_list_lovable";

// Варианты времени для бронирования (например, с 08:00 до 23:00, шаг 1 час)
const TIME_OPTIONS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
  "22:00 - 23:00",
];

type Props = {
  open: boolean;
  onClose: () => void;
  parking: Parking | null;
};

function getNextBookingId() {
  try {
    const arr = JSON.parse(localStorage.getItem(BOOKINGS_LS_KEY) || "[]");
    if (!Array.isArray(arr) || arr.length === 0) return 1;
    return Math.max(...arr.map((x: any) => x.id || 1)) + 1;
  } catch {
    return 1;
  }
}

// Генерируем бронирование для Bookings
function mapParkingToBooking(parking: Parking, date: Date, time: string) {
  return {
    id: getNextBookingId(),
    status: "active",
    title: parking.name,
    address: parking.address,
    date: format(date, "dd.MM.yyyy"),
    time,
    // Для demo: транспонируем parking.id в букву + номер
    place: "A-" + parking.id,
    price: (parking.prices[0]?.price || 0),
  }
}

const ParkingModal: React.FC<Props> = ({ open, onClose, parking }) => {
  const { toast } = useToast();

  // состояния для даты и времени
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");

  React.useEffect(() => {
    // Сброс даты/времени при открытии другого паркинга/модалки
    if (open) {
      setSelectedDate(undefined);
      setSelectedTime("");
    }
  }, [open, parking]);

  if (!parking) return null;

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;

    // 1. Считываем текущие брони
    const arrRaw = localStorage.getItem(BOOKINGS_LS_KEY);
    let arr = [];
    try {
      arr = arrRaw ? JSON.parse(arrRaw) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch { arr = []; }

    // 2. Создаем новую запись с выбранной датой и временем
    const booking = mapParkingToBooking(parking, selectedDate, selectedTime);

    // 3. Пушим, сохраняем
    arr.unshift(booking); // новые сверху
    localStorage.setItem(BOOKINGS_LS_KEY, JSON.stringify(arr));

    // 4. Показываем тост
    toast({
      title: "Бронирование успешно!",
      description: `Парковка "${parking.name}" на ${booking.date} в ${booking.time} успешно забронирована.`,
      variant: "default",
    });

    // 5. Закрываем модал
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-primary">
            <CircleParking className="w-7 h-7 text-blue-500" />
            {parking.name}
          </DialogTitle>
          <div className="text-muted-foreground text-md">{parking.address}</div>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="mb-1 text-sm text-gray-400">До {parking.distance} м от здания</div>
          <div className="bg-secondary/60 rounded-lg p-4 mb-4">
            <h3 className="text-md font-semibold mb-2">Прайс-лист</h3>
            <div className="divide-y divide-muted">
              {parking.prices.map((p, idx) => (
                <div key={idx} className="flex justify-between py-1">
                  <span>{p.type}</span>
                  <span className="font-mono font-semibold">{p.price} {p.currency}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4 flex gap-4 max-sm:flex-col">
            {/* Выбор даты */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarIcon className="w-4 h-4" />
                Дата
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={new Date()}
                className="p-3 pointer-events-auto border rounded-md"
                locale={ruLocale}
              />
            </div>
            {/* Выбор времени */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <ClockIcon className="w-4 h-4" />
                Время
              </div>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full font-bold"
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime}
          >
            Забронировать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParkingModal;
