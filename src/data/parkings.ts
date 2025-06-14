
export interface Parking {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  prices: { type: string; price: number; currency: string; }[];
  distance: number; // в метрах
}

export const mockParkings: Parking[] = [
  {
    id: 'p1',
    name: 'Паркинг у ТЦ Европа',
    address: 'ул. Гагарина, 1',
    lat: 55.751244,
    lng: 37.618423,
    prices: [
      { type: '1 час', price: 120, currency: '₽' },
      { type: 'Весь день', price: 800, currency: '₽' },
    ],
    distance: 150,
  },
  {
    id: 'p2',
    name: 'Паркинг у Офиса Сити',
    address: 'пр. Ленина, 12Б',
    lat: 55.753933,
    lng: 37.620795,
    prices: [
      { type: '1 час', price: 90, currency: '₽' },
      { type: 'Весь день', price: 650, currency: '₽' },
    ],
    distance: 350,
  },
  {
    id: 'p3',
    name: 'Крытая парковка Plaza',
    address: 'ул. Мясницкая, 35',
    lat: 55.757867,
    lng: 37.634974,
    prices: [
      { type: '1 час', price: 150, currency: '₽' },
      { type: 'Весь день', price: 950, currency: '₽' },
    ],
    distance: 420,
  },
];
