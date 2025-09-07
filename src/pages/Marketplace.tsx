import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Calendar, Plus, DollarSign, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Classified {
  id: string;
  title: string;
  category: string;
  description: string;
  condition: string;
  price: number;
  images: string[];
  location_text: string;
  created_at: string;
  contact_whatsapp?: string;
  contact_email?: string;
  store_contact?: string;
}

export default function Marketplace() {
  const { t } = useLanguage();
  const [classifieds, setClassifieds] = useState<Classified[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = ['food', 'toys', 'accessories', 'medicine', 'services', 'other'];

  useEffect(() => {
    fetchClassifieds();
  }, [searchTerm, categoryFilter]);

  const fetchClassifieds = async () => {
    let query = supabase
      .from('classifieds')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching classifieds:', error);
    } else {
      setClassifieds(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t('nav.marketplace')}</h1>
          <Link to="/marketplace/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </Link>
        </div>

        {/* Warning Alert */}
        <Alert className="mb-6 border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold text-destructive">
            {t('disclaimer.animalSales')}
          </AlertDescription>
        </Alert>

        {/* Filters */}
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classifieds Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classifieds.map((classified) => (
            <Card key={classified.id} className="overflow-hidden">
              {classified.images?.[0] && (
                <div className="aspect-video bg-muted">
                  <img 
                    src={classified.images[0]} 
                    alt={classified.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{classified.title}</h3>
                  {classified.category && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {classified.category.charAt(0).toUpperCase() + classified.category.slice(1)}
                    </span>
                  )}
                </div>
                
                {classified.price && (
                  <div className="flex items-center text-lg font-bold text-primary mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{classified.price.toLocaleString()}</span>
                  </div>
                )}
                
                {classified.condition && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Estado: {classified.condition}
                  </p>
                )}
                
                <p className="text-sm mb-3 line-clamp-2">{classified.description}</p>
                
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{classified.location_text}</span>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(classified.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {classified.contact_whatsapp && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`https://wa.me/${classified.contact_whatsapp}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {classified.contact_email && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${classified.contact_email}`}>
                        Email
                      </a>
                    </Button>
                  )}
                  {classified.store_contact && (
                    <Button size="sm" variant="outline">
                      {classified.store_contact}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && classifieds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}
      </main>
    </div>
  );
}