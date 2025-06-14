
import React, { useEffect, useRef, useState } from "react";
import { mockParkings, Parking } from "@/data/parkings";
import ParkingModal from "./ParkingModal";

// Вставьте сюда Ваш публичный Google Maps API KEY!
const GOOGLE_MAPS_API_KEY = "AIzaSyCZJouUKXbkDnhTstfABeu63Kh7WeZjxCM";

const mapInitial = {
  lng: 37.62,
  lat: 55.75,
  zoom: 12,
};

declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

const GoogleParkingMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Загружаем скрипт гугл карт
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    window.initMap = () => setMapLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Optionally cleanup
    };
  }, []);

  // Когда скрипт инициализирован — создаём карту и маркеры
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const gmap = new window.google.maps.Map(mapRef.current, {
      center: { lat: mapInitial.lat, lng: mapInitial.lng },
      zoom: mapInitial.zoom,
      disableDefaultUI: true,
      clickableIcons: false,
    });
    setMap(gmap);

    // Добавляем кастомные маркеры парковок
    mockParkings.forEach((parking) => {
      const marker = new window.google.maps.Marker({
        position: { lat: parking.lat, lng: parking.lng },
        map: gmap,
        title: parking.name,
        icon: {
          path: "M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
          fillColor: "#30b27a",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#fff",
          scale: 2,
          anchor: new window.google.maps.Point(12, 22),
        },
      });
      marker.addListener("click", () => {
        setSelectedParking(parking);
        setModalOpen(true);
      });
    });
  }, [mapLoaded]);

  return (
    <div className="w-full h-[calc(100vh-64px)] relative flex justify-center items-start bg-card shadow-lg rounded-xl overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full rounded-xl z-10" />
      <ParkingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        parking={selectedParking}
      />
    </div>
  );
};

export default GoogleParkingMap;

