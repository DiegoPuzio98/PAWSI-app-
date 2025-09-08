import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface LocationPickerProps {
  onLocationChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
}

export const LocationPicker = ({ onLocationChange, disabled }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no disponible en este navegador");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoordinates(newCoords);
        onLocationChange(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        setError("No se pudo obtener la ubicación. Verifique los permisos.");
        setLoading(false);
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [onLocationChange]);

  const clearLocation = () => {
    setCoordinates(null);
    onLocationChange(null, null);
    setError(null);
  };

  const handleManualInput = (field: 'lat' | 'lng', value: string) => {
    if (!coordinates) {
      setCoordinates({ lat: 0, lng: 0 });
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newCoords = { 
        ...coordinates!, 
        [field]: numValue 
      };
      setCoordinates(newCoords);
      onLocationChange(newCoords.lat, newCoords.lng);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={disabled || loading}
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          {loading ? "Obteniendo..." : "Usar mi ubicación"}
        </Button>
        
        {coordinates && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearLocation}
            disabled={disabled}
            size="sm"
          >
            Limpiar
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {coordinates && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Latitud</label>
            <Input
              type="number"
              step="any"
              value={coordinates.lat}
              onChange={(e) => handleManualInput('lat', e.target.value)}
              disabled={disabled}
              className="text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Longitud</label>
            <Input
              type="number"
              step="any"
              value={coordinates.lng}
              onChange={(e) => handleManualInput('lng', e.target.value)}
              disabled={disabled}
              className="text-xs"
            />
          </div>
        </div>
      )}

      {coordinates && (
        <p className="text-xs text-muted-foreground">
          📍 Ubicación guardada: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
};