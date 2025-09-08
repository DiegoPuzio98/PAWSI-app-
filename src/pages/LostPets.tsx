import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { PostActions } from "@/components/PostActions";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Plus, Clock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

interface LostPost {
  id: string;
  title: string;
  species: string;
  breed: string;
  colors: string[];
  description: string;
  location_text: string;
  images: string[];
  created_at: string;
  lost_at: string;
  expires_at: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
}

export default function LostPets() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<LostPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [searchParams] = useSearchParams();

  const handleResetFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setColorFilters([]);
    setLocationFilter("");
  };

  useEffect(() => {
    // Initialize from URL params once
    const q = searchParams.get('q');
    const sp = searchParams.get('species');
    if (q) setSearchTerm(q);
    if (sp) setSpeciesFilter(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, speciesFilter, colorFilters, locationFilter]);

  const fetchPosts = async () => {
    let query = supabase
      .from('lost_posts')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_text.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%`);
    }

    if (speciesFilter && speciesFilter !== 'all') {
      query = query.eq('species', speciesFilter);
    }

    if (locationFilter) {
      query = query.ilike('location_text', `%${locationFilter}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      let filteredData = data || [];
      
      // Filter by colors
      if (colorFilters.length > 0) {
        filteredData = filteredData.filter((post) => {
          return post.colors && colorFilters.some((color) => post.colors.includes(color));
        });
      }
      
      setPosts(filteredData);
    }
    setLoading(false);
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiration = new Date(expiresAt);
    const now = new Date();
    const daysLeft = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t('nav.lost')}</h1>
          <Link to="/lost/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('home.postAlert')}
            </Button>
          </Link>
        </div>

        {/* Advanced Search */}
        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          speciesFilter={speciesFilter}
          onSpeciesFilterChange={setSpeciesFilter}
          colorFilters={colorFilters}
          onColorFiltersChange={setColorFilters}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          onReset={handleResetFilters}
        />

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className={`overflow-hidden ${isExpiringSoon(post.expires_at) ? 'border-destructive' : ''}`}>
              {post.images?.[0] && (
                <div className="aspect-video bg-muted">
                  <img 
                    src={post.images[0]} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <div className="flex flex-col items-end gap-1">
                    {post.species && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                        {t(`species.${post.species}`)}
                      </span>
                    )}
                    {isExpiringSoon(post.expires_at) && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expira pronto
                      </span>
                    )}
                  </div>
                </div>
                
                {post.breed && (
                  <p className="text-sm text-muted-foreground mb-2">{post.breed}</p>
                )}

                {post.colors && post.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.colors.map((color) => (
                      <Badge key={color} variant="secondary" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-sm mb-3 line-clamp-2">{post.description}</p>
                
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{post.location_text}</span>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Perdida: {new Date(post.lost_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Expira: {new Date(post.expires_at).toLocaleDateString()}</span>
                </div>

                <PostActions 
                  postId={post.id}
                  postType="lost"
                  contactWhatsapp={post.contact_whatsapp}
                  contactPhone={post.contact_phone}
                  contactEmail={post.contact_email}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron mascotas perdidas</p>
          </div>
        )}
      </main>
    </div>
  );
}