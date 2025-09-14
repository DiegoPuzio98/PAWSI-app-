import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, X, Search, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);

  // Region context derived from user profile
  const [regionQuery, setRegionQuery] = useState<string | null>(null);
  const [regionBBox, setRegionBBox] = useState<number[] | null>(null); // [minX, minY, maxX, maxY]
  const [searchBBox, setSearchBBox] = useState<number[] | null>(null); // active bbox filter (municipio/departamento)
  const [hasMarker, setHasMarker] = useState<boolean>(false);

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

  // Cargar región desde el perfil y centrar el mapa; precargar departamentos/municipios
  useEffect(() => {
    const loadRegion = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country, province')
          .eq('id', user.id)
          .single();

        const region = [profile?.province, profile?.country].filter(Boolean).join(', ');
        if (!region) return;
        setRegionQuery(region);

        // Geocodificar región para obtener centro y bbox
        const regionRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(region)}.json?types=place,region&access_token=${mapboxgl.accessToken}&limit=1`);
        const regionJson = await regionRes.json();
        const regionFeature = regionJson.features?.[0];
        if (regionFeature) {
          const bbox = regionFeature.bbox as number[] | undefined;
          if (bbox) setRegionBBox(bbox);
          const center = regionFeature.center as [number, number];
          if (mapRef.current && center) {
            mapRef.current.flyTo({ center, zoom: 10 });
          }
        }

      } catch (e) {
        console.warn('No se pudo cargar la región del perfil', e);
      }
    };
    loadRegion();
  }, [user]);

  // Mantener búsqueda limitada a la región del perfil
  useEffect(() => {
    setSearchBBox(regionBBox);
  }, [regionBBox]);

  const placeMarker = (lngLat: [number, number]) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = new mapboxgl.Marker()
      .setLngLat(lngLat)
      .addTo(mapRef.current);
    setHasMarker(true);
  };

  const clearLocation = () => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = null;
    setHasMarker(false);
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
      // Construir consulta contextualizada por la región del perfil
      const contextParts = [
        regionQuery || ''
      ].filter(Boolean);
      const fullQuery = [searchQuery.trim(), contextParts.join(', ')].filter(Boolean).join(', ');

      const bboxBase = (searchBBox || regionBBox);
      const bboxParam = bboxBase ? `&bbox=${bboxBase.join(',')}` : '';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullQuery)}.json?types=address,poi,neighborhood,locality,place&access_token=${mapboxgl.accessToken}&limit=1${bboxParam}`;
      const response = await fetch(url);
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
        <div className="space-y-3 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Busca una dirección o haz clic en el mapa para seleccionar una ubicación. El buscador está limitado a tu ciudad.
          </p>


          <div className="flex gap-2">
            <Input
              placeholder={`Buscar en ${regionQuery || 'tu zona'}`}
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
      {showManualSelection && hasMarker && (
        <div className="flex justify-end mt-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const pos = markerRef.current?.getLngLat();
              if (pos) {
                callbackRef.current?.(pos.lat, pos.lng);
              }
            }}
          >
            <Check className="h-4 w-4 mr-2" /> Confirmar ubicación
          </Button>
        </div>
      )}
    </div>
  );
};