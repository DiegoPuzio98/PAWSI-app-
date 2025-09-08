import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MapPickerProps {
  onLocationChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  height?: number;
}

export const MapPicker: React.FC<MapPickerProps> = ({ onLocationChange, disabled, height = 280 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get Mapbox token from Edge Function
        const { data, error } = await supabase.functions.invoke("get-mapbox-token", { body: {} });
        if (error) throw error;
        const token = (data as any)?.token as string | undefined;
        if (!token) {
          throw new Error("Mapbox token not configured. Please add it in Supabase Edge Function secrets.");
        }
        mapboxgl.accessToken = token;

        if (!containerRef.current || !isMounted) return;
        setInitializing(true);

        // Initialize map centered globally
        mapRef.current = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          projection: "globe",
          zoom: 2.2,
          center: [0, 20],
          pitch: 30,
        });

        // Controls
        mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
          showUserHeading: true,
        });
        mapRef.current.addControl(geolocate, "top-right");

        // When user clicks the geolocate button
        geolocate.on("geolocate", (e: any) => {
          const lat = e.coords.latitude as number;
          const lng = e.coords.longitude as number;
          placeMarker([lng, lat]);
          onLocationChange(lat, lng);
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, speed: 1.2 });
        });

        // Click to place marker
        mapRef.current.on("click", (ev) => {
          if (disabled) return;
          const { lng, lat } = ev.lngLat;
          placeMarker([lng, lat]);
          onLocationChange(lat, lng);
        });

        mapRef.current.on("style.load", () => {
          mapRef.current?.setFog({
            color: "rgb(255,255,255)",
            "high-color": "rgb(200, 200, 225)",
            "horizon-blend": 0.2,
          } as any);
        });
      } catch (err: any) {
        console.error("Map init error", err);
        if (!isMounted) return;
        setError(err?.message ?? "Error inicializando el mapa");
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onLocationChange, disabled]);

  const placeMarker = (lngLat: [number, number]) => {
    if (!mapRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker({ color: "#ea580c" }) // semantic primary-ish
      .setLngLat(lngLat)
      .addTo(mapRef.current);
  };

  const clearLocation = () => {
    markerRef.current?.remove();
    markerRef.current = null;
    onLocationChange(null, null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled || initializing || loading} onClick={() => {
          // Trigger the GeolocateControl button programmatically
          const buttons = containerRef.current?.parentElement?.querySelectorAll(
            ".mapboxgl-ctrl-geolocate"
          );
          (buttons?.[0] as HTMLButtonElement | undefined)?.click();
        }}>
          {initializing || loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
          {initializing || loading ? "Cargando mapa..." : "Usar mi ubicación"}
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