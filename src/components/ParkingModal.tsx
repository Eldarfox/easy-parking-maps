
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Parking } from "@/data/parkings";
import { CircleParking } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BOOKINGS_LS_KEY = "bookings_list_lovable";

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
function mapParkingToBooking(parking: Parking) {
  return {
    id: getNextBookingId(),
    status: "active",
    title: parking.name,
    address: parking.address,
    date: new Date().toLocaleDateString("ru-RU"),
    time: "09:00 - 21:00",
    // Для demo: транспонируем parking.id в букву + номер
    place: "A-" + parking.id,
    price: (parking.prices[0]?.price || 0),
  }
}

const ParkingModal: React.FC<Props> = ({ open, onClose, parking }) => {
  const { toast } = useToast();

  if (!parking) return null;

  const handleBooking = () => {
    // 1. Считываем текущие брони
    const arrRaw = localStorage.getItem(BOOKINGS_LS_KEY);
    let arr = [];
    try {
      arr = arrRaw ? JSON.parse(arrRaw) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch { arr = []; }

    // 2. Создаем новую запись
    const booking = mapParkingToBooking(parking);

    // 3. Пушим, сохраняем
    arr.unshift(booking); // новые сверху
    localStorage.setItem(BOOKINGS_LS_KEY, JSON.stringify(arr));

    // 4. Показываем тост
    toast({
      title: "Бронирование успешно!",
      description: `Парковка "${parking.name}" успешно забронирована.`,
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
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition"
            onClick={handleBooking}
          >
            Забронировать
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParkingModal;
