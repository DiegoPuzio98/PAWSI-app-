import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { PostActions } from "@/components/PostActions";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface ReportedPost {
  id: string;
  title: string;
  species: string | null;
  breed: string | null;
  colors: string[];
  description: string | null;
  location_text: string;
  location_lat?: number | null;
  location_lng?: number | null;
  images: string[];
  created_at: string;
  contact_whatsapp?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status: string;
}

const speciesKeyForI18n = (s?: string | null) => {
  switch (s) {
    case 'dog': return 'dogs';
    case 'cat': return 'cats';
    case 'bird': return 'birds';
    case 'rodent': return 'rodents';
    case 'fish': return 'fish';
    default: return s || '';
  }
};

export default function ReportedPets() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");

  const handleResetFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setColorFilters([]);
    setLocationFilter("");
  };

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, speciesFilter, colorFilters, locationFilter]);

  const fetchPosts = async () => {
    let query = supabase
      .from('reported_posts')
      .select('*')
      .eq('status', 'active')
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t('nav.reported')}</h1>
          <Link to="/reported/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('home.reportSighting')}
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
            <Card key={post.id} className="overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/reported/${post.id}`)}>
              {post.images?.[0] && (
                <div className="aspect-video bg-muted">
                  <img 
                    src={post.images[0].startsWith('http') 
                      ? post.images[0] 
                      : `https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${post.images[0]}`
                    }
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  {post.species && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {t(`species.${speciesKeyForI18n(post.species)}`)}
                    </span>
                  )}
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
                
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <PostActions 
                  postId={post.id}
                  postType="reported"
                  contactWhatsapp={post.contact_whatsapp}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron mascotas reportadas</p>
          </div>
        )}
      </main>
    </div>
  );
}