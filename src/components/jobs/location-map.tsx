"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle, Info } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";

// Import Leaflet CSS directly
import "leaflet/dist/leaflet.css";

// Add global CSS to fix z-index issues with modals
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .leaflet-container {
      z-index: 1 !important;
    }
    .leaflet-control-container {
      z-index: 1 !important;
    }
    .leaflet-popup {
      z-index: 1 !important;
    }
  `;
  document.head.appendChild(style);
}

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  location: string;
  companyName?: string;
}

// Custom hook to handle map initialization
function useMapInitialization() {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Fix Leaflet icon issues
    const fixLeafletIcons = async () => {
      try {
        const L = await import("leaflet");

        // Fix for default markers in react-leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        setIsMapReady(true);
        setMapError(null);
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Error al cargar el mapa");
        setIsMapReady(true); // Still set to true to show fallback
      }
    };

    fixLeafletIcons();
  }, []);

  return { isMapReady, mapError };
}

export function LocationMap({
  latitude,
  longitude,
  location,
  companyName,
}: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const { isMapReady, mapError } = useMapInitialization();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fix z-index issues with modals
  useEffect(() => {
    const fixMapZIndex = () => {
      // Find all leaflet map containers and set their z-index
      const mapContainers = document.querySelectorAll(".leaflet-container");
      mapContainers.forEach((container) => {
        (container as HTMLElement).style.zIndex = "1";
      });
    };

    // Run immediately and after a short delay to catch dynamically created elements
    fixMapZIndex();
    const timeoutId = setTimeout(fixMapZIndex, 100);

    return () => clearTimeout(timeoutId);
  }, [isMapReady]);

  // Default coordinates for Cochabamba, Bolivia
  const defaultLat = -17.3895;
  const defaultLng = -66.1568;

  const hasCoordinates =
    latitude && longitude && !isNaN(latitude) && !isNaN(longitude);
  const lat = hasCoordinates ? latitude : defaultLat;
  const lng = hasCoordinates ? longitude : defaultLng;

  // Create Google Maps and OpenStreetMap URLs (for potential future use)
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;

  // Only render the map on the client side and when map is ready
  if (!isClient || !isMapReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Ubicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Location Info */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{location}</p>
                {companyName && (
                  <p className="text-sm text-gray-600">{companyName}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {hasCoordinates ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <MapPin className="w-3 h-3" />
                      <span>Ubicación exacta</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Ubicación aproximada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates Display */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>
                  Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
                {!hasCoordinates && (
                  <p className="text-amber-600">
                    Mostrando ubicación aproximada en Cochabamba, Bolivia
                  </p>
                )}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-64 w-full rounded-lg border border-gray-200 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Cargando mapa...</p>
              </div>
            </div>

            {/* Additional Location Information */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>
                <Info className="w-3 h-3 inline mr-1" />
                Ubicación exacta del empleo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there was an error loading the map, show fallback
  if (mapError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Ubicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Location Info */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{location}</p>
                {companyName && (
                  <p className="text-sm text-gray-600">{companyName}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {hasCoordinates ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <MapPin className="w-3 h-3" />
                      <span>Ubicación exacta</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Ubicación aproximada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates Display */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>
                  Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
                {!hasCoordinates && (
                  <p className="text-amber-600">
                    Mostrando ubicación aproximada en Cochabamba, Bolivia
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            <div className="h-64 w-full rounded-lg border border-gray-200 overflow-hidden bg-red-50 flex items-center justify-center">
              <div className="text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">Error al cargar el mapa</p>
                <p className="text-xs mt-1">
                  No se pudo cargar el mapa interactivo
                </p>
              </div>
            </div>

            {/* Additional Location Information */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>
                <Info className="w-3 h-3 inline mr-1" />
                Ubicación exacta del empleo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Ubicación</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Location Info */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">{location}</p>
              {companyName && (
                <p className="text-sm text-gray-600">{companyName}</p>
              )}
              <div className="flex items-center justify-center gap-2 mt-2">
                {hasCoordinates ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <MapPin className="w-3 h-3" />
                    <span>Ubicación exacta</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Ubicación aproximada</span>
                  </div>
                )}
              </div>
            </div>

            {/* Coordinates Display */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>
                Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
              {!hasCoordinates && (
                <p className="text-amber-600">
                  Mostrando ubicación aproximada en Cochabamba, Bolivia
                </p>
              )}
            </div>
          </div>

          {/* Interactive Map */}
          <div
            ref={mapRef}
            className="h-64 w-full rounded-lg border border-gray-200 overflow-hidden relative z-0"
            style={{ zIndex: 1 }}
          >
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
              zoomControl={true}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              dragging={true}
              touchZoom={true}
              className="map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-medium">{companyName || "Empresa"}</p>
                    <p className="text-sm text-gray-600">{location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Additional Location Information */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>
              <Info className="w-3 h-3 inline mr-1" />
              Ubicación exacta del empleo
            </p>
            <p>
              Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
