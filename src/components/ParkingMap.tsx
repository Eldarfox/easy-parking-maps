
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { mockParkings, Parking } from "@/data/parkings";
import ParkingModal from "./ParkingModal";
import { CircleParking } from "lucide-react";

// ВСТАВЬТЕ СЮДА ВАШ ПУБЛИЧНЫЙ MAPBOX TOKEN
const MAPBOX_PUBLIC_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndjM3bWpoN3gifQ._V8QWxY06K1I1sZI1y8vfg"; // Пример: стандартный публичный токен demotoken

const mapInitial = {
  lng: 37.62,
  lat: 55.75,
  zoom: 12,
};

type MapboxMap = mapboxgl.Map;

const ParkingMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      zoom: mapInitial.zoom,
      center: [mapInitial.lng, mapInitial.lat],
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.current.scrollZoom.disable();

    // Маркеры парковок
    mockParkings.forEach((parking) => {
      // Создаём HTML-иконку (svg)
      const markerEl = document.createElement("div");
      markerEl.className = "rounded-full shadow-lg cursor-pointer flex items-center justify-center";
      markerEl.style.width = "34px";
      markerEl.style.height = "34px";
      markerEl.style.background = "#30b27a";
      markerEl.style.border = "2px solid #fff";
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.innerHTML =
        `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24"
          class="w-7 h-7 mx-auto text-white"
          xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" /><path d="M7 12h10M12 7v10" /></svg>`;

      markerEl.onmouseenter = () => markerEl.style.background = "#38cf90";
      markerEl.onmouseleave = () => markerEl.style.background = "#30b27a";
      markerEl.onclick = (e) => {
        e.stopPropagation();
        setSelectedParking(parking);
        setModalOpen(true);
      };

      new mapboxgl.Marker({
        element: markerEl,
        anchor: "center",
        color: "#30b27a",
      }).setLngLat([parking.lng, parking.lat]).addTo(map.current!);
    });

    // Эффект атмосферы
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="w-full relative flex justify-center items-start bg-card shadow-lg rounded-xl overflow-hidden"
      style={{ height: "calc(100vh - 128px)" }} // 128 = header + bottom bar height
    >
      {/* Больше нет поля для токена! */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-xl z-10" />
 
      {/* Модальное окно парковки */}
      <ParkingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        parking={selectedParking}
      />
    </div>
  );
};

export default ParkingMap;
