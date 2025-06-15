
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
    from: number;
    to: number;
  };
  workingHours: {
    from: number;
    to: number;
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
      { type: "Ночь", price: 120, currency: "сом" },
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
      { type: "Ночь", price: 150, currency: "сом" },
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
      { type: "Ночь", price: 100, currency: "сом" },
    ],
    distance: 500,
    totalSpaces: 3,
    nightHours: { from: 22, to: 6 },
    workingHours: { from: 7, to: 20 },
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
      { type: "Ночь", price: 170, currency: "сом" },
    ],
    distance: 1800,
    totalSpaces: 1,
    nightHours: { from: 19, to: 9 },
    workingHours: { from: 0, to: 24 },
  },
  // Новые фейковые парковки ниже
  {
    id: "5",
    name: "Парковка ТРЦ Asia Mall",
    address: "Asia Mall, Бишкек",
    lat: 42.8547,
    lng: 74.6035,
    prices: [
      { type: "1 час", price: 75, currency: "сом" },
      { type: "Весь день", price: 320, currency: "сом" },
      { type: "Ночь", price: 90, currency: "сом" },
    ],
    distance: 950,
    totalSpaces: 2,
    nightHours: { from: 21, to: 7 },
    workingHours: { from: 8, to: 24 },
  },
  {
    id: "6",
    name: "Парковка возле Ош базара",
    address: "просп. Чуй, 123, Бишкек",
    lat: 42.8663,
    lng: 74.5831,
    prices: [
      { type: "1 час", price: 50, currency: "сом" },
      { type: "Весь день", price: 200, currency: "сом" },
    ],
    distance: 2100,
    totalSpaces: 8,
    workingHours: { from: 6, to: 22 },
  },
  {
    id: "7",
    name: "Парковка Vefa Center",
    address: "Vefa Center, Бишкек",
    lat: 42.8651,
    lng: 74.6177,
    prices: [
      { type: "1 час", price: 85, currency: "сом" },
      { type: "Весь день", price: 500, currency: "сом" },
    ],
    distance: 1700,
    totalSpaces: 10,
    workingHours: { from: 8, to: 21 },
  },
  {
    id: "8",
    name: "Открытая парковка Драмтеатр",
    address: "ул. Абдымомунова, 20, Бишкек",
    lat: 42.8682,
    lng: 74.6115,
    prices: [
      { type: "1 час", price: 60, currency: "сом" },
    ],
    distance: 1200,
    totalSpaces: 6,
    workingHours: { from: 7, to: 19 },
  },
  {
    id: "9",
    name: "Паркинг на площади Ала-Тоо",
    address: "пл. Ала-Тоо, Бишкек",
    lat: 42.8766,
    lng: 74.6044,
    prices: [
      { type: "1 час", price: 100, currency: "сом" },
      { type: "Весь день", price: 600, currency: "сом" },
      { type: "Ночь", price: 200, currency: "сом" },
    ],
    distance: 400,
    totalSpaces: 5,
    nightHours: { from: 22, to: 7 },
    workingHours: { from: 8, to: 24 },
  },
  {
    id: "10",
    name: "Парковка Спорткомплекс Колос",
    address: "ул. Киевская, 322, Бишкек",
    lat: 42.8405,
    lng: 74.6039,
    prices: [
      { type: "1 час", price: 40, currency: "сом" },
      { type: "Весь день", price: 150, currency: "сом" },
    ],
    distance: 2200,
    totalSpaces: 11,
    workingHours: { from: 8, to: 21 },
  }
];

