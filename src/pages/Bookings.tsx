
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parse, isBefore, differenceInMinutes, addMinutes } from "date-fns";
import { useVirtualNow } from "@/hooks/useVirtualNow";

const BOOKINGS_LS_KEY = "bookings_list_lovable";

// --- New: Bishkek timezone helpers ---
const BISHKEK_TIMEZONE_OFFSET = 6 * 60; // Минуты UTC+6

// Унифицированная функция: получает локальное время начала брони
function getBookingStartDateTime(booking: { date: string, time: string }) {
  let day: number, month: number, year: number;

  if (booking.date.includes(".")) {
    // формат дд.мм.гггг
    const parts = booking.date.split(".");
    if (parts.length !== 3) return new Date(NaN);
    [day, month, year] = parts.map(Number);
  } else if (booking.date.includes("-")) {
    // формат гггг-мм-дд
    const parts = booking.date.split("-");
    if (parts.length !== 3) return new Date(NaN);
    [year, month, day] = parts.map(Number);
  } else {
    return new Date(NaN);
  }

  // ⚠️ Новый способ извлечь время начала (например: "14:00 - 18:00" → "14:00")
  const timeStart = booking.time?.split("-")[0]?.trim() || "00:00";
  const [hour, minute] = timeStart.split(":").map(Number);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    isNaN(hour) || isNaN(minute)
  ) {
    return new Date(NaN);
  }

  return new Date(year, month - 1, day, hour, minute);
}

// Новая функция: определяет дату и время окончания бронирования по booking
function getBookingEndDateTime(booking: { date: string; time: string }) {
  let day: number, month: number, year: number;

  if (booking.date.includes(".")) {
    // формат дд.мм.гггг
    const parts = booking.date.split(".");
    if (parts.length !== 3) return new Date(NaN);
    [day, month, year] = parts.map(Number);
  } else if (booking.date.includes("-")) {
    // формат гггг-мм-дд
    const parts = booking.date.split("-");
    if (parts.length !== 3) return new Date(NaN);
    [year, month, day] = parts.map(Number);
  } else {
    return new Date(NaN);
  }

  // Например: "14:00 - 18:00" → "18:00"
  let timeEnd = booking.time?.split("-")[1]?.trim();
  if (!timeEnd) {
    // Если нет второго времени, используем start
    timeEnd = booking.time?.split("-")[0]?.trim() || "00:00";
  }
  const [hour, minute] = timeEnd.split(":").map(Number);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    isNaN(hour) || isNaN(minute)
  ) {
    return new Date(NaN);
  }

  return new Date(year, month - 1, day, hour, minute);
}

function BookingStatus({status}: {status: string}) {
  if (status === "active")
    return (
      <Badge variant="secondary" className="ml-1 text-green-700 bg-green-100 border-green-400">
        <span className="flex items-center gap-1">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-green-600"><path fill="currentColor" d="M9 17L4.5 12.5l1.41-1.42L9 14.17l9.09-9.09L19.5 6.5z"/></svg>
          Активно
        </span>
      </Badge>
    );
  if (status === "completed")
    return (
      <Badge variant="secondary" className="ml-1 text-blue-700 bg-blue-50 border-blue-300">
        <span className="flex items-center gap-1">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-blue-700"><path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>
          Завершено
        </span>
      </Badge>
    );
  return null;
}

function BookingCard({
  booking,
  onCancel,
  onProlong,
}: {
  booking: {
    id: number;
    status: string;
    title: string;
    address: string;
    date: string;
    time: string;
    place: string;
    price: number;
  };
  onCancel?: () => void;
  onProlong?: () => void;
}) {
  const isActive = booking.status === "active";
  let showCancel = false;

  // Используем виртуальное время приложения:
  const now = useVirtualNow();

  // ----- DEBUG вывод для отслеживания ситуации -----
  // Покажем, что получено на входе:
  console.log(
    `[DEBUG] booking.date: ${booking.date}, booking.time: ${booking.time}`
  );

  if (isActive) {
    const bookingStart = getBookingStartDateTime(booking);

    // Показываем тип и значение расчёта даты
    console.log(
      `[DEBUG] bookingStart type: ${typeof bookingStart}, toString: ${bookingStart.toString()}`
    );

    // Новая логика: показывать, если до старта осталось больше 2 часов (120 минут)
    if (!isNaN(bookingStart.getTime())) {
      const isFuture = isBefore(now, bookingStart);
      const minutesLeft = differenceInMinutes(bookingStart, now);
      showCancel = isFuture && minutesLeft >= 120;

      // Для отладки:
      console.log(
        `Виртуальное сейчас: ${now.toLocaleString()} | ` +
        `Начало брони: ${bookingStart.toLocaleString()} | ` +
        `Минут до начала: ${minutesLeft} | ` +
        `Можно отменить: ${showCancel}`
      );
    } else {
      // Если дата некорректна
      console.warn(
        `[WARN] Некорректная дата/время для booking.id=${booking.id}. Проверьте формат!`
      );
    }
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm mb-4 p-5 animate-fade-in">
      <div className="flex items-center mb-1 justify-between">
        <span className="font-semibold text-lg">{booking.title}</span>
        <BookingStatus status={booking.status} />
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
        <svg className="mr-1 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.657 16.243l-4.95 4.95a2 2 0 01-2.828 0l-4.95-4.95a8 8 0 1112.728 0zM12 14a2 2 0 100-4 2 2 0 000 4z"
          />
        </svg>
        {booking.address}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mb-2">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" /> {booking.date}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/></svg> 
          {booking.time}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M7 17v1a2 2 0 002 2h6a2 2 0 002-2v-1M17 17V9a5 5 0 00-10 0v8m10 0H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Место {booking.place}
        </div>
        <div className="font-bold text-xl text-black">{booking.price} ₽</div>
      </div>
      <div className="flex gap-3 mt-4">
        {isActive && (
          <>
            {showCancel && (
              <Button variant="destructive" className="flex-1" onClick={onCancel}>
                Отменить
              </Button>
            )}
            <Button variant="secondary" className="flex-1" onClick={onProlong}>
              Продлить
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const { toast } = useToast();

  // Получаем виртуальное время
  const virtualNow = useVirtualNow();

  // Функция получения массива броней из localStorage
  function initialLoad() {
    try {
      const raw = localStorage.getItem(BOOKINGS_LS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Авто-обновление статуса "active" → "completed" по виртуальному времени
  useEffect(() => {
    // Для всех активных броней сравниваем конец бронирования с виртуальным временем
    const updated = bookings.map((b) => {
      if (b.status !== "active") return b;
      const bookingEnd = getBookingEndDateTime(b);
      if (isNaN(bookingEnd.getTime())) return b; // некорректная дата, не трогаем
      // Если сейчас даже больше или равно концу бронь → completed
      if (virtualNow >= bookingEnd) {
        return { ...b, status: "completed" };
      }
      return b;
    });

    // Если хоть один статус изменился, обновляем LS и state (сравнение по ссылке)
    const changed =
      bookings.length === updated.length &&
      bookings.some((b, i) => b.status !== updated[i].status);

    if (changed) {
      setBookings(updated);
      localStorage.setItem(BOOKINGS_LS_KEY, JSON.stringify(updated));
    }
    // eslint-disable-next-line
  }, [virtualNow, bookings]);

  useEffect(() => {
    setBookings(initialLoad());
    const onStorage = (e: StorageEvent) => {
      if (e.key === BOOKINGS_LS_KEY) {
        setBookings(initialLoad());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Отменить бронь
  const handleCancel = (id: number) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    localStorage.setItem(BOOKINGS_LS_KEY, JSON.stringify(updated));
    toast({
      title: "Бронирование отменено",
      description: "Вы отменили бронирование.",
      variant: "destructive"
    });
  };

  // Продлить бронь
  const handleProlong = (booking: any) => {
    toast({
      title: "Продление успешно",
      description: `Бронирование “${booking.title}” продлено на 2 часа.`,
      variant: "default"
    });
  };

  return (
    <div className="max-w-md mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-1">Мои бронирования</h1>
      <div className="text-gray-500 text-base mb-6">История и активные бронирования</div>
      {bookings.length === 0 && (
        <div className="text-sm text-muted-foreground text-center mt-32">Нет активных или прошедших бронирований</div>
      )}
      {bookings.map((b) => (
        <BookingCard
          key={b.id}
          booking={b}
          onCancel={b.status === "active" ? () => handleCancel(b.id) : undefined}
          onProlong={b.status === "active" ? () => handleProlong(b) : undefined}
        />
      ))}
    </div>
  );
};

export default Bookings;

