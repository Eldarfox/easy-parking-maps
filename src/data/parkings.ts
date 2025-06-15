
export interface Parking {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  prices: { type: string; price: number; currency: string }[];
  distance: number;
  totalSpaces: number;
  nightHours?: {
    from: number; // Час начала ночного тарифа (24ч)
    to: number;   // Час окончания (например, 8)
  };
  workingHours: {
    from: number; // Час открытия (например, 7 = 07:00)
    to: number;   // Час закрытия (например, 23 = 23:00, 24 = круглосуточно)
  };
}

export const mockParkings: Parking[] = [
  {
    id: "1",
    name: "Крытая парковка Дордой Плаза",
    address: "Дордой Плаза, Бишкек",
    lat: 42.878633,
    lng: 74.617215,
    prices: [
      { type: "1 час", price: 70, currency: "сом" },
      { type: "Весь день", price: 350, currency: "сом" },
      { type: "Ночь", price: 120, currency: "сом" }
    ],
    distance: 200,
    totalSpaces: 4,
    nightHours: { from: 20, to: 8 },
    workingHours: { from: 7, to: 24 },
  },
  {
    id: "2",
    name: "Крытая парковка ГУМ",
    address: "ГУМ, Бишкек",
    lat: 42.875413,
    lng: 74.615353,
    prices: [
      { type: "1 час", price: 80, currency: "сом" },
      { type: "Весь день", price: 400, currency: "сом" },
      { type: "Ночь", price: 150, currency: "сом" }
    ],
    distance: 400,
    totalSpaces: 2,
    nightHours: { from: 21, to: 7 },
    workingHours: { from: 8, to: 23 },
  },
  {
    id: "3",
    name: "Парковка ЦУМ (центр города)",
    address: "ЦУМ, Бишкек",
    lat: 42.87591,
    lng: 74.612875,
    prices: [
      { type: "1 час", price: 60, currency: "сом" },
      { type: "Весь день", price: 280, currency: "сом" },
      { type: "Ночь", price: 100, currency: "сом" }
    ],
    distance: 500,
    totalSpaces: 3,
    nightHours: { from: 22, to: 6 },
    workingHours: { from: 7, to: 20 }, // работает только днем
  },
  {
    id: "4",
    name: "Подземная парковка Асанбай Центр",
    address: "Асанбай Центр, Бишкек",
    lat: 42.822968,
    lng: 74.585654,
    prices: [
      { type: "1 час", price: 90, currency: "сом" },
      { type: "Весь день", price: 450, currency: "сом" },
      { type: "Ночь", price: 170, currency: "сом" }
    ],
    distance: 1800,
    totalSpaces: 1,
    nightHours: { from: 19, to: 9 },
    workingHours: { from: 0, to: 24 }, // круглосуточно
  },
];
