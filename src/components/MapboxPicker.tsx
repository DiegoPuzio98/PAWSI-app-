import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiZGllZ29wMDA5OCIsImEiOiJjbWZha3A0MmgxYWcxMm1wa3p1dW13aHczIn0.UMYPIYk7DziVJNkBe3v-2A";

interface MapboxPickerProps {
  onLocationChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  height?: number;
}

export const MapboxPicker: React.FC<MapboxPickerProps> = ({ onLocationChange, disabled, height = 280 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = () => {
      try {
        setLoading(true);
        setError(null);

        if (!containerRef.current || !isMounted) return;

        // Initialize map
        mapRef.current = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [0, 20],
          zoom: 2,
        });

        // Add navigation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Click to place marker
        mapRef.current.on("click", (ev) => {
          if (disabled) return;
          const { lat, lng } = ev.lngLat;
          placeMarker([lng, lat]);
          onLocationChange(lat, lng);
        });

        mapRef.current.on('load', () => {
          setLoading(false);
        });

      } catch (err: any) {
        console.error("Map init error", err);
        if (!isMounted) return;
        setError(err?.message ?? "Error inicializando el mapa");
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange, disabled]);

  const placeMarker = (lngLat: [number, number]) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = new mapboxgl.Marker()
      .setLngLat(lngLat)
      .addTo(mapRef.current);
  };

  const clearLocation = () => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = null;
    onLocationChange(null, null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          placeMarker([lng, lat]);
          onLocationChange(lat, lng);
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("No se pudo obtener la ubicación actual");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation no está soportado en este navegador");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled || loading} onClick={getCurrentLocation}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
          {loading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearLocation} disabled={disabled}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div
        ref={containerRef}
        style={{ height, borderRadius: 8, overflow: "hidden" }}
        className="relative w-full bg-muted"
        aria-label="Seleccionar ubicación en mapa"
      />
    </div>
  );
};