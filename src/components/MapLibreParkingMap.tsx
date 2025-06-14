
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const mapInitial = {
  lng: 37.62,
  lat: 55.75,
  zoom: 12,
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
