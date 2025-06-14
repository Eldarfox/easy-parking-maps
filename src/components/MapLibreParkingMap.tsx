
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mockParkings } from "@/data/parkings";

const mapInitial = {
  lng: 74.605930,
  lat: 42.874621,
  zoom: 13,
};

const MapLibreParkingMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [mapInitial.lng, mapInitial.lat],
      zoom: mapInitial.zoom,
    });

    // Добавляем маркеры паркингов
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
      // Основная доработка: z-индекс
      el.style.zIndex = "99";

      el.onmouseenter = () => (el.style.background = "#2563eb");
      el.onmouseleave = () => (el.style.background = "#3b82f6");

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
    </div>
  );
};

export default MapLibreParkingMap;
