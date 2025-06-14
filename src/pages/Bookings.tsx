
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const BOOKINGS = [
  {
    id: 1,
    status: "active",
    title: "Центральная парковка",
    address: "ул. Тверская, 15",
    date: "2024-01-15",
    time: "14:00 - 18:00",
    place: "A-15",
    price: 600,
  },
  {
    id: 2,
    status: "completed",
    title: "ТЦ Европейский",
    address: "пл. Киевского Вокзала, 2",
    date: "2024-01-12",
    time: "10:00 - 16:00",
    place: "B-23",
    price: 720,
  },
];

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
}: {
  booking: typeof BOOKINGS[0];
}) {
  const isActive = booking.status === "active";
  return (
    <div className="bg-white border rounded-xl shadow-sm mb-4 p-5">
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
            <Button variant="destructive" className="flex-1">Отменить</Button>
            <Button variant="secondary" className="flex-1">Продлить</Button>
          </>
        )}
      </div>
    </div>
  );
}

const Bookings = () => (
  <div className="max-w-md mx-auto py-8 px-2">
    <h1 className="text-3xl font-bold mb-1">Мои бронирования</h1>
    <div className="text-gray-500 text-base mb-6">История и активные бронирования</div>
    {BOOKINGS.map((b) => (
      <BookingCard key={b.id} booking={b} />
    ))}
  </div>
);

export default Bookings;
