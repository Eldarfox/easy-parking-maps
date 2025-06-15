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

// --- Новый хелпер: вычислить количество полных/частичных часов между двумя временем ---
function getBookingHours(booking: { time: string }) {
  // Ожидается формат "HH:MM - HH:MM"
  if (!booking.time || !booking.time.includes("-")) return 1;
  const [fromStr, toStr] = booking.time.split("-").map((x) => x.trim());
  const [hF, mF] = fromStr.split(":").map(Number);
  const [hT, mT] = toStr.split(":").map(Number);
  if (
    isNaN(hF) ||
    isNaN(hT) ||
    isNaN(mF) ||
    isNaN(mT)
  )
    return 1;
  let diff =
    (hT * 60 + mT) -
    (hF * 60 + mF);
  if (diff <= 0) diff += 24 * 60; // Если ночная и через полночь
  const hours = Math.ceil(diff / 60);
  return hours;
}

// --- Получение почасовой цены из данных парковки (этот кусок берём из LS) ---
function getParkingHourlyRate(booking: any) {
  try {
    // Паркинг id у нас хранится в booking.parkingId
    const parkingsRaw = localStorage.getItem("parkings_data_lovable");
    if (!parkingsRaw) return booking.price || 100;
    const parkings = JSON.parse(parkingsRaw);
    const p = parkings.find((x: any) => x.id === booking.parkingId);
    // Находим нужный прайс
    if (p && Array.isArray(p.prices)) {
      const hourly = p.prices.find((pr: any) => pr.type?.toLowerCase().includes("час"));
      if (hourly && Number(hourly.price) > 0) return Number(hourly.price);
    }
    return booking.price || 100;
  } catch {
    return booking.price || 100;
  }
}

const statusOrder: Record<string, number> = {
  active: 0,
  reserved: 1,
  completed: 2,
};

function BookingStatus({status}: {status: string}) {
  if (status === "reserved")
    return (
      <Badge variant="secondary" className="ml-1 text-yellow-700 bg-yellow-100 border-yellow-400">
        <span className="flex items-center gap-1">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-yellow-600"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/></svg>
          Забронировано
        </span>
      </Badge>
    );
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
    parkingId?: string;
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

  // --- NEW: расчет суммы ---
  let summary = booking.price;
  let summaryLine = null;
  // Проверяем — если формат времени "HH:MM - HH:MM", то почасовой
  if (booking.time?.includes("-") && booking.time.match(/\d{2}:\d{2}/g)?.length === 2) {
    const hours = getBookingHours(booking);
    const hourly = getParkingHourlyRate(booking);
    summary = hours * hourly;
    summaryLine = (
      <div className="text-sm text-muted-foreground">
        {hours} ч × {hourly} ₽/ч = <span className="font-bold">{summary} ₽</span>
      </div>
    );
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
        <div className="font-bold text-xl text-black">{summary} ₽</div>
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

  // --- Новый useEffect с переходом статусов в правильной последовательности ---
  useEffect(() => {
    const updated = bookings.map((b) => {
      // 1. reserved → active если пришло время начала
      if (b.status === "reserved") {
        const bookingStart = getBookingStartDateTime(b);
        if (!isNaN(bookingStart.getTime()) && virtualNow >= bookingStart) {
          return { ...b, status: "active" };
        }
        return b;
      }
      // 2. active → completed, если пришло время окончания
      if (b.status === "active") {
        const bookingEnd = getBookingEndDateTime(b);
        if (!isNaN(bookingEnd.getTime()) && virtualNow >= bookingEnd) {
          return { ...b, status: "completed" };
        }
        return b;
      }
      // 3. Остальные не меняются
      return b;
    });

    const changed =
      bookings.length === updated.length &&
      bookings.some((b, i) => b.status !== updated[i].status);

    if (changed) {
      setBookings(updated);
      localStorage.setItem(BOOKINGS_LS_KEY, JSON.stringify(updated));
    }
    // eslint-disable-next-line
  }, [virtualNow]);

  // <<< NEW: Загружаем bookings из localStorage при изменении виртуального времени >>>
  useEffect(() => {
    setBookings(initialLoad());
    // eslint-disable-next-line
  }, [virtualNow]);
  // <<< END NEW >>>

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

  // --- Переход на reserved, если до начала больше 10 минут (оставляем) ---
  useEffect(() => {
    const raw = initialLoad();
    const now = virtualNow;
    const up = raw.map((b: any) => {
      if (b.status === "active") {
        const bookingStart = getBookingStartDateTime(b);
        if (!isNaN(bookingStart.getTime())) {
          const minDiff = differenceInMinutes(bookingStart, now);
          if (minDiff > 10) {
            return { ...b, status: "reserved" };
          }
        }
      }
      return b;
    });
    setBookings(up);
  // eslint-disable-next-line
  }, [virtualNow]);

  // --- Сортировка array перед отображением ---
  function getSortedBookings(arr: any[]) {
    return [...arr].sort((a, b) => {
      const soA = statusOrder[a.status] ?? 99;
      const soB = statusOrder[b.status] ?? 99;
      if (soA !== soB) return soA - soB;
      // Если статус одинаков, сортируем по дате начала (ближайшие выше)
      const dsA = getBookingStartDateTime(a);
      const dsB = getBookingStartDateTime(b);
      if (isNaN(dsA.getTime()) || isNaN(dsB.getTime())) return 0;
      return dsA.getTime() - dsB.getTime();
    });
  }

  const sortedBookings = getSortedBookings(bookings);

  return (
    <div className="max-w-md mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-1">Мои бронирования</h1>
      <div className="text-gray-500 text-base mb-6">История и активные бронирования</div>
      {sortedBookings.length === 0 && (
        <div className="text-sm text-muted-foreground text-center mt-32">Нет активных или прошедших бронирований</div>
      )}
      {sortedBookings.map((b) => (
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
