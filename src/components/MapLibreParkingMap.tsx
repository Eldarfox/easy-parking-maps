
import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mockParkings, Parking } from "@/data/parkings";
import ParkingModal from "./ParkingModal";

type TariffType = "hourly" | "daily" | "night" | undefined;

const mapInitial = {
  lng: 74.605930,
  lat: 42.874621,
  zoom: 13,
};

function isNightTime(nightFrom: number, nightTo: number, hours: {from: number, to: number}) {
  // True если ночные часы попадают в рабочие часы парковки (любое пересечение)
  // например nightFrom=22, nightTo=7; рабочие: from=7, to=20 (не пересекается)
  // Переведём интервалы в массив часов и ищем пересечение
  const nightHours: number[] = [];
  if (nightFrom < nightTo) {
    for (let h = nightFrom; h < nightTo; h++) nightHours.push(h % 24);
  } else {
    for (let h = nightFrom; h < nightFrom + 24; h++) {
      const hr = h % 24;
      if (hr >= nightFrom || hr < nightTo) nightHours.push(hr);
      if (hr === ((nightTo - 1 + 24) % 24)) break;
    }
  }
  const workHours: number[] = [];
  if (hours.from < hours.to) {
    for (let h = hours.from; h < hours.to; h++) workHours.push(h % 24);
  } else {
    for (let h = hours.from; h < hours.from + 24; h++) {
      const hr = h % 24;
      if (hr >= hours.from || hr < hours.to) workHours.push(hr);
      if (hr === ((hours.to - 1 + 24) % 24)) break;
    }
  }
  // Проверка пересечения
  return nightHours.some(h => workHours.includes(h));
}

function isNowInWorkingHours(hours: {from: number, to: number}) {
  const now = new Date();
  const hour = now.getHours();
  if (hours.from < hours.to) {
    return hour >= hours.from && hour < hours.to;
  } else {
    // Круглосуточно или пересечение через 00:00
    return hour >= hours.from || hour < hours.to;
  }
}

const MapLibreParkingMap: React.FC<{ tariff?: TariffType }> = ({ tariff }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [open, setOpen] = useState(false);
  const [currentParking, setCurrentParking] = useState<Parking | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [mapInitial.lng, mapInitial.lat],
      zoom: mapInitial.zoom,
    });

    // Фильтруем парковки  
    let shownParkings: Parking[] = [];
    if (tariff === "night") {
      shownParkings = mockParkings.filter(
        p =>
          p.nightHours &&
          isNightTime(p.nightHours.from, p.nightHours.to, p.workingHours)
      );
    } else {
      // Показываем только те, которые сейчас работают
      shownParkings = mockParkings.filter(p => isNowInWorkingHours(p.workingHours));
    }

    shownParkings.forEach((parking) => {
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
  }, [tariff]);

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

