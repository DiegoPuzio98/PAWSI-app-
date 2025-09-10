import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Calendar, Plus, Phone, Globe, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface Veterinarian {
  id: string;
  name: string;
  description: string;
  address: string;
  location_lat?: number;
  location_lng?: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  services?: string[];
  images?: string[];
  created_at: string;
}

export default function Veterinarians() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<{ country?: string; province?: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('country, province')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    fetchVeterinarians();
  }, [searchTerm, userProfile]);

  const fetchVeterinarians = async () => {
    let query = supabase
      .from('veterinarians')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filter by user's province strictly if available
    if (userProfile?.province) {
      query = query.eq('province', userProfile.province);
    }

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching veterinarians:', error);
    } else {
      setVeterinarians(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t('nav.veterinarians')}</h1>
          <Link to="/veterinarians/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Veterinaria
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('action.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Veterinarians Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {veterinarians.map((vet) => (
            <Link key={vet.id} to={`/post/veterinarians/${vet.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {vet.images?.[0] && (
                  <div className="aspect-video bg-muted">
                    <img 
                      src={vet.images[0]} 
                      alt={vet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-2">{vet.name}</h3>
                    
                    <div className="flex items-start text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{vet.address}</span>
                    </div>
                    
                    {vet.description && (
                      <p className="text-sm mb-3 line-clamp-2">{vet.description}</p>
                    )}
                    
                    {vet.services && vet.services.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {vet.services.slice(0, 3).map((service, index) => (
                            <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {service}
                            </span>
                          ))}
                          {vet.services.length > 3 && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                              +{vet.services.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(vet.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline">
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!loading && veterinarians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron veterinarias</p>
            <div className="mt-4">
              <Link to="/veterinarians/new">
                <Button>Agregar la primera veterinaria</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}