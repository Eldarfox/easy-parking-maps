
import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { mockParkings, Parking } from "@/data/parkings";
import ParkingModal from "./ParkingModal";
import { useState, useEffect } from "react";

// Настройка кастомной иконки для маркера парковки
const parkingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
});

const mapInitial: LatLngExpression = [55.75, 37.62];

const MarkerPopup = ({
  parking,
  onClick,
}: {
  parking: Parking;
  onClick: (p: Parking) => void;
}) => (
  <Marker
    position={[parking.lat, parking.lng]}
    icon={parkingIcon}
    eventHandlers={{
      click: () => onClick(parking),
    }}
  >
    <Popup>
      <div className="text-base font-bold mb-1">{parking.name}</div>
      <div className="text-sm text-muted-foreground mb-2">{parking.address}</div>
      <button 
        className="mt-1 w-full rounded bg-blue-500 text-white px-3 py-1 hover:bg-blue-700 transition font-semibold"
        onClick={() => onClick(parking)}
      >
        Подробнее
      </button>
    </Popup>
  </Marker>
);

const OpenStreetParkingMap: React.FC = () => {
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Поправка для отображения карты корректно при рендерах
  const mapRef = useRef(null);

  // Костыль, чтобы листовка не ругалась на размер контейнера
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 400); 
  }, []);

  return (
    <div className="w-full relative flex justify-center items-start bg-card shadow-lg rounded-xl overflow-hidden"
      style={{ height: "calc(100vh - 128px)" }}
    >
      <MapContainer
        center={mapInitial}
        zoom={12}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0.75rem"
        }}
        ref={mapRef}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockParkings.map((p) => (
          <MarkerPopup
            key={p.id}
            parking={p}
            onClick={(parking) => {
              setSelectedParking(parking);
              setModalOpen(true);
            }}
          />
        ))}
      </MapContainer>
      {/* Модальное окно парковки */}
      <ParkingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        parking={selectedParking}
      />
    </div>
  );
};

export default OpenStreetParkingMap;
