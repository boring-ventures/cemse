"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({
  onChange,
  initialPosition,
}: {
  onChange: (latlng: [number, number]) => void;
  initialPosition?: [number, number] | null;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || null
  );

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useMapEvents({
    click(e: LeafletMouseEvent) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onChange(newPos);
    },
  });

  return position ? (
    <Marker position={position} icon={markerIcon as L.Icon} />
  ) : null;
}

function ForceResize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

export default function MapPicker({
  onChange,
  initialCoordinates,
}: {
  onChange: (latlng: [number, number]) => void;
  initialCoordinates?: [number, number] | null;
}) {
  const [isClient, setIsClient] = useState(false);
  const center: L.LatLngExpression = initialCoordinates || [-17.3935, -66.157]; // Cochabamba

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    );
  }

  // Add error boundary for map rendering
  try {
    return (
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
      >
        <ForceResize />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onChange={onChange}
          initialPosition={initialCoordinates}
        />
      </MapContainer>
    );
  } catch (error) {
    console.error("MapPicker error:", error);
    return (
      <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Error al cargar el mapa</div>
      </div>
    );
  }
}
