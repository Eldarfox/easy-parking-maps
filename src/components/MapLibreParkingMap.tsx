
import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mockParkings, Parking } from "@/data/parkings";
import ParkingModal from "./ParkingModal";

// Добавим типизацию для пропа tariff
type TariffType = "hourly" | "daily" | "night" | undefined;

const mapInitial = {
  lng: 74.605930,
  lat: 42.874621,
  zoom: 13,
};

const MapLibreParkingMap: React.FC<{ tariff?: TariffType }> = ({ tariff }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [open, setOpen] = useState(false);
  const [currentParking, setCurrentParking] = useState<Parking | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [mapInitial.lng, mapInitial.lat],
      zoom: mapInitial.zoom,
    });

    mockParkings.forEach((parking) => {
      const el = document.createElement("div");
      el.className =
        "rounded-full shadow cursor-pointer flex items-center justify-center";
      el.style.width = "36px";
      el.style.height = "36px";
      el.style.background = "#3b82f6";
      el.style.border = "2px solid #fff";
      el.innerHTML =
        `<svg stroke="currentColor" fill="#fff" stroke-width="2" viewBox="0 0 24 24" class="w-6 h-6 mx-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" /><path d="M7 12h10M12 7v10" /></svg>`;
      el.style.zIndex = "99";
      el.onmouseenter = () => (el.style.background = "#2563eb");
      el.onmouseleave = () => (el.style.background = "#3b82f6");
      el.onclick = () => {
        setCurrentParking(parking);
        setOpen(true);
      };
      new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([parking.lng, parking.lat])
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div
      className="w-full relative flex justify-center items-start bg-card shadow-lg rounded-xl overflow-hidden"
      style={{ height: "calc(100vh - 128px)" }}
    >
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full rounded-xl z-10"
      />
      <ParkingModal
        open={open}
        onClose={() => setOpen(false)}
        parking={currentParking}
        tariff={tariff}
      />
    </div>
  );
};

export default MapLibreParkingMap;
