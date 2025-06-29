import MapLibreParkingMap from "@/components/MapLibreParkingMap";
import BottomBar from "@/components/BottomBar";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ParkingModal from "@/components/ParkingModal";
import { Parking } from "@/data/parkings";
import { Car, Sun, Moon, Clock } from "lucide-react";

const tariffsConfig: Record<string, { label: string; Icon: React.FC<any> }> = {
  hourly: { label: "Почасовой", Icon: Clock },
  daily: { label: "Дневной", Icon: Sun },
  night: { label: "Ночной", Icon: Moon },
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tariff: "hourly" | "daily" | "night" | undefined = location.state?.tariff;

  const openParkingModal = (parking: Parking) => {
    setSelectedParking(parking);
    setShowModal(true);
  };

  // Баннер выбранного тарифа (если есть) с кликом
  const TariffBanner = () => {
    if (!tariff || !tariffsConfig[tariff]) return null;
    const { label, Icon } = tariffsConfig[tariff];
    return (
      <button
        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md mb-4 mx-auto shadow max-w-xs transition hover:bg-blue-200 active:scale-95"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/tariffs")}
        type="button"
      >
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label} тариф выбран</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50 flex flex-col justify-center items-center p-0 m-0 overflow-hidden">
      <div className="w-full max-w-none flex-1 flex flex-col relative">
        <header className="w-full flex justify-between items-center px-8 py-4 bg-background/80 border-b z-20 shadow-sm select-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-blue-700 tracking-tight select-none">
              Parking Booking
            </span>
            <span className="ml-1 text-md font-semibold text-muted-foreground hidden md:inline">Онлайн бронирование парковки</span>
          </div>
        </header>
        <main className="flex-1 w-full overflow-hidden relative">
          {tariff && (
            <div className="absolute top-4 left-1/2 z-30 -translate-x-1/2">
              <TariffBanner />
            </div>
          )}

          <MapLibreParkingMap tariff={tariff} />

          <ParkingModal
            open={showModal}
            onClose={() => setShowModal(false)}
            parking={selectedParking}
            tariff={tariff}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
