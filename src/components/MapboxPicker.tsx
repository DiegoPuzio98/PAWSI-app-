import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, X, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);

  // Keep a stable reference to the callback to avoid re-initializing the map
  const callbackRef = useRef(onLocationChange);
  useEffect(() => {
    callbackRef.current = onLocationChange;
  }, [onLocationChange]);

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
          callbackRef.current?.(lat, lng);
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
  }, []);

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
    callbackRef.current?.(null, null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          placeMarker([lng, lat]);
          callbackRef.current?.(lat, lng);
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

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        placeMarker([lng, lat]);
        callbackRef.current?.(lat, lng);
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
        setError(null);
      } else {
        setError("No se encontró la ubicación");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Error al buscar la ubicación");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="button" variant="outline" size="sm" disabled={disabled || loading} onClick={getCurrentLocation}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
          {loading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setShowManualSelection(!showManualSelection)}
          disabled={disabled}
        >
          <Search className="h-4 w-4 mr-2" />
          Seleccionar manualmente
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearLocation} disabled={disabled}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      </div>
      
      {showManualSelection && (
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Busca una dirección o haz clic en el mapa para seleccionar una ubicación
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              disabled={disabled || isSearching}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={searchLocation}
              disabled={disabled || isSearching || !searchQuery.trim()}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
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