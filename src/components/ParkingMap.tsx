
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { mockParkings, Parking } from "@/data/parkings";
import ParkingModal from "./ParkingModal";
import { toast } from "@/hooks/use-toast";
import { CircleParking } from "lucide-react";

const mapInitial = {
  lng: 37.62,
  lat: 55.75,
  zoom: 12,
};

type MapboxMap = mapboxgl.Map;

const ParkingMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [token, setToken] = useState<string>("");
  const [showTokenField, setShowTokenField] = useState(true);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Спрятать поле после ввода
  function handleStart() {
    if (token.length < 20) {
      toast({ title: "Введите корректный Mapbox token", variant: "destructive" });
      return;
    }
    setShowTokenField(false);
  }

  useEffect(() => {
    if (!mapContainer.current || !token || showTokenField) return;

    mapboxgl.accessToken = token;

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
  }, [token, showTokenField]);

  return (
    <div className="w-full h-[calc(100vh-32px)] relative flex justify-center items-start bg-card shadow-lg rounded-xl overflow-hidden">
      {/* Mapbox token input */}
      {showTokenField && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-full bg-white border p-6 rounded-xl shadow-lg flex flex-col items-center gap-2">
          <CircleParking className="w-8 h-8 text-blue-600 mb-1" />
          <div className="text-lg font-semibold mb-2">Введите Mapbox Public Token</div>
          <input
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-400"
            placeholder="pk.eyJ1..."
            value={token}
            onChange={e => setToken(e.target.value.trim())}
            autoFocus
          />
          <div className="text-xs text-muted-foreground mb-2">
            Получите бесплатный token на <a href="https://mapbox.com/account/access-tokens/" className="text-blue-500 underline" target="_blank">mapbox.com</a>
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
            onClick={handleStart}
          >
            Показать карту
          </button>
        </div>
      )}

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
