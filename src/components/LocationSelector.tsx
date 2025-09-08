import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationSelectorProps {
  country: string;
  province: string;
  onCountryChange: (country: string) => void;
  onProvinceChange: (province: string) => void;
  disabled?: boolean;
}

const countries = [
  "Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Ecuador", 
  "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", 
  "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela"
];

const provinces: Record<string, string[]> = {
  "Argentina": ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  "México": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
  "Colombia": ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"],
  "Chile": ["Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"],
  "Perú": ["Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"]
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  country,
  province,
  onCountryChange,
  onProvinceChange,
  disabled = false
}) => {
  const handleCountryChange = (newCountry: string) => {
    onCountryChange(newCountry);
    onProvinceChange(""); // Reset province when country changes
  };

  const availableProvinces = country ? provinces[country] || [] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          País
        </label>
        <Select value={country} onValueChange={handleCountryChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((countryOption) => (
              <SelectItem key={countryOption} value={countryOption}>
                {countryOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Provincia/Estado
        </label>
        <Select 
          value={province} 
          onValueChange={onProvinceChange} 
          disabled={disabled || !country || availableProvinces.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu provincia/estado" />
          </SelectTrigger>
          <SelectContent>
            {availableProvinces.map((provinceOption) => (
              <SelectItem key={provinceOption} value={provinceOption}>
                {provinceOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};