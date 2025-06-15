import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Parking } from "@/data/parkings";
import { CircleParking, Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import ClockTimeSelector from "./ClockTimeSelector";

// Добавим тип тарифа:
type TariffType = "hourly" | "daily" | "night" | undefined;

const BOOKINGS_LS_KEY = "bookings_list_lovable";

type BookingItem = {
  id: number;
  status: string;
  title: string;
  address: string;
  date: string;
  time: string;
  place: string;
  price: number;
  parkingId: string;
  spaceNum: number;
};

const getNextBookingId = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(BOOKINGS_LS_KEY) || "[]");
    if (!Array.isArray(arr) || arr.length === 0) return 1;
    return Math.max(...arr.map((x: any) => x.id || 1)) + 1;
  } catch {
    return 1;
  }
};

function mapParkingToBooking(parking: Parking, date: Date, time: string, spaceNum: number) {
  return {
    id: getNextBookingId(),
    status: "active",
    title: parking.name,
    address: parking.address,
    date: format(date, "dd.MM.yyyy"),
    time,
    place: `Место #${spaceNum + 1}`,
    price: parking.prices[0]?.price || 0,
    parkingId: parking.id,
    spaceNum,
  };
}

// Изменяем пропсы, чтобы принимать tariff:
const ParkingModal: React.FC<{ open: boolean; onClose: () => void; parking: Parking | null; tariff?: TariffType }> = ({
  open,
  onClose,
  parking,
  tariff,
}) => {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeRange, setSelectedTimeRange] = useState<[number, number] | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [allBookings, setAllBookings] = React.useState<BookingItem[]>([]);

  React.useEffect(() => {
    if (open) {
      setSelectedDate(undefined);
      setSelectedTimeRange(null);
      setSelectedSpace("");
      try {
        const arr = JSON.parse(localStorage.getItem(BOOKINGS_LS_KEY) || "[]");
        setAllBookings(Array.isArray(arr) ? arr : []);
      } catch {
        setAllBookings([]);
      }
    }
  }, [open, parking, tariff]);

  // --- Логика отключения времени для места, даты
  const disabledHours = React.useMemo(() => {
    if (!parking || !selectedDate || !selectedSpace) return [];
    const selectedSpaceNum = parseInt(selectedSpace, 10);
    const thisDate = format(selectedDate, "dd.MM.yyyy");

    const busyRanges: [number, number][] = allBookings
      .filter(
        (b) =>
          b.parkingId === parking.id &&
          b.date === thisDate &&
          b.spaceNum === selectedSpaceNum
      )
      .map((b) => {
        const [start, end] = b.time
          .split(" - ")
          .map((t) => parseInt(t.split(":")[0], 10));
        return [start, end - 1] as [number, number];
      });

    const disabled: number[] = [];
    busyRanges.forEach(([from, to]) => {
      for (let h = from; h <= to; h++) {
        disabled.push(h);
      }
    });
    return Array.from(new Set(disabled));
  }, [allBookings, parking, selectedDate, selectedSpace]);

  const unavailableSpaces = React.useMemo(() => {
    if (!parking || !selectedDate || !selectedTimeRange) return [];
    const thisDate = format(selectedDate, "dd.MM.yyyy");
    const [selectedStart, selectedEnd] = selectedTimeRange;
    return allBookings
      .filter(
        (b) =>
          b.parkingId === parking.id &&
          b.date === thisDate &&
          (() => {
            const [bStart, bEnd] = b.time
              .split(" - ")
              .map((t) => parseInt(t.split(":")[0], 10));
            return (
              (selectedStart <= bEnd - 1 && selectedEnd >= bStart)
            );
          })()
      )
      .map((b) => b.spaceNum);
  }, [allBookings, parking, selectedDate, selectedTimeRange]);

  const allSpaces = React.useMemo(() => {
    if (!parking) return [];
    return Array.from({ length: parking.totalSpaces }, (_, i) => i);
  }, [parking]);

  // --- Новое: подгоняем тайм-рендж для "дневного" тарифа сразу
  React.useEffect(() => {
    if (tariff === "daily" && selectedDate && selectedSpace) {
      setSelectedTimeRange([8, 22]);
    }
  }, [tariff, selectedDate, selectedSpace]);

  // Hooks должны идти до этого возврата!
  if (!parking) return null;

  const getTimeStr = () => {
    if (!selectedTimeRange) return "";
    const [start, end] = selectedTimeRange;
    return `${start.toString().padStart(2, "0")}:00 - ${(end + 1).toString().padStart(2, "0")}:00`;
  };

  const handleBooking = () => {
    if (!selectedDate || (!selectedTimeRange && tariff !== "daily") || selectedSpace === "") return;

    const arrRaw = localStorage.getItem(BOOKINGS_LS_KEY);
    let arr = [];
    try {
      arr = arrRaw ? JSON.parse(arrRaw) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    const timeStr =
      tariff === "daily"
        ? "08:00 - 23:00"
        : getTimeStr();

    const booking = {
      ...mapParkingToBooking(parking, selectedDate, timeStr, parseInt(selectedSpace, 10)),
      time: timeStr,
    };

    arr.unshift(booking);
    localStorage.setItem(BOOKINGS_LS_KEY, JSON.stringify(arr));

    toast({
      title: "Бронирование успешно!",
      description: `Парковка "${parking.name}", место #${parseInt(selectedSpace, 10) + 1} на ${booking.date} в ${booking.time} успешно забронирована.`,
      variant: "default",
    });

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
            <div className={`flex-1 min-w-0 flex flex-col ${tariff === "daily" ? "h-[340px]" : ""}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarIcon className="w-4 h-4" />
                Дата
              </div>
              {/* Показываем время сверху при дневном тарифе */}
              {tariff === "daily" && (
                <div className="text-sm text-gray-600 font-medium mb-2">
                  Время: <span className="font-semibold">08:00 - 23:00</span>
                </div>
              )}
              <div className={`flex-1 min-h-0 w-full ${tariff === "daily" ? "" : ""}`}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  fromDate={new Date()}
                  className={`border rounded-md ${tariff === "daily" ? "flex-1 min-h-0 w-full h-full p-0" : "p-3"} pointer-events-auto`}
                  locale={ru}
                />
              </div>
            </div>
            {/* Блок выбора времени полностью убираем для дневного тарифа */}
            {tariff !== "daily" && (
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <ClockIcon className="w-4 h-4" />
                  Время (часы)
                </div>
                <ClockTimeSelector
                  value={selectedTimeRange}
                  onChange={setSelectedTimeRange}
                  disabledHours={disabledHours}
                />
              </div>
            )}
          </div>
          {/* Селектор парковочного места */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <CircleParking className="w-4 h-4" />
              Место парковки
            </div>
            <Select value={selectedSpace} onValueChange={(val) => { setSelectedSpace(val); if(tariff !== "daily") setSelectedTimeRange(null); }} disabled={!selectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите место" />
              </SelectTrigger>
              <SelectContent>
                {allSpaces.map((spaceNum) =>
                  tariff === "daily"
                    ? (() => {
                        const thisDate =
                          selectedDate && format(selectedDate, "dd.MM.yyyy");
                        const isBusy = allBookings.some(
                          (b) =>
                            b.parkingId === parking.id &&
                            b.date === thisDate &&
                            b.spaceNum === spaceNum &&
                            b.time === "08:00 - 23:00"
                        );
                        return (
                          <SelectItem
                            key={spaceNum}
                            value={spaceNum.toString()}
                            disabled={isBusy}
                          >
                            Место #{spaceNum + 1}
                            {isBusy ? " (занято)" : ""}
                          </SelectItem>
                        );
                      })()
                    : (unavailableSpaces.includes(spaceNum) ? (
                        <SelectItem key={spaceNum} value={spaceNum.toString()} disabled>
                          Место #{spaceNum + 1} (занято)
                        </SelectItem>
                      ) : (
                        <SelectItem key={spaceNum} value={spaceNum.toString()}>
                          Место #{spaceNum + 1}
                        </SelectItem>
                      ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full font-bold"
            onClick={handleBooking}
            disabled={
              !selectedDate ||
              (tariff !== "daily" && !selectedTimeRange) ||
              selectedSpace === ""
            }
          >
            Забронировать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParkingModal;
