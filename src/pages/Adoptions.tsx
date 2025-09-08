import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Plus, Heart } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PostActions } from "@/components/PostActions";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { Badge } from "@/components/ui/badge";

interface AdoptionPost {
  id: string;
  title: string;
  species: string;
  breed: string;
  age: string;
  description: string;
  location_text: string;
  images: string[];
  colors: string[];
  created_at: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
}

export default function Adoptions() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<AdoptionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [userProfile, setUserProfile] = useState<{country?: string, province?: string} | null>(null);
  const [searchParams] = useSearchParams();
  const [highlights, setHighlights] = useState<Set<string>>(new Set());

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
    // Initialize from URL params once
    const q = searchParams.get('q');
    const sp = searchParams.get('species');
    if (q) setSearchTerm(q);
    if (sp) setSpeciesFilter(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchHighlights();
    }
  }, [searchTerm, speciesFilter, colorFilters, locationFilter, userProfile, user]);

  const fetchPosts = async () => {
    let query = supabase
      .from('adoption_posts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filter by user's province strictly if available
    if (userProfile?.province) {
      query = query.eq('province', userProfile.province);
    }

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
      // Filter by colors if any are selected
      let filteredData = data || [];
      if (colorFilters.length > 0) {
        filteredData = filteredData.filter(post => 
          post.colors && colorFilters.some(color => 
            post.colors.includes(color)
          )
        );
      }
      setPosts(filteredData);
    }
    setLoading(false);
  };

  const fetchHighlights = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_highlights')
      .select('post_id')
      .eq('user_id', user.id)
      .eq('post_type', 'adoption');
    
    if (data) {
      setHighlights(new Set(data.map(h => h.post_id)));
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setColorFilters([]);
    setLocationFilter("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t('nav.adoptions')}</h1>
          <Link to="/adoptions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar Adopción
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
          onReset={handleReset}
        />

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-l-4 border-l-primary cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/adoption/${post.id}`)}>
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
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-primary" />
                    {post.species && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {t(`species.${speciesKeyForI18n(post.species)}`)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mb-2">
                  {post.breed && (
                    <span className="text-sm text-muted-foreground">
                      Raza: {post.breed}
                    </span>
                  )}
                  {post.age && (
                    <span className="text-sm text-muted-foreground">
                      Edad: {post.age}
                    </span>
                  )}
                </div>

                {/* Colors */}
                {post.colors && post.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.colors.slice(0, 3).map((color) => (
                      <Badge key={color} variant="outline" className="text-xs">
                        🎨 {color}
                      </Badge>
                    ))}
                    {post.colors.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.colors.length - 3}
                      </Badge>
                    )}
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

                {/* Post Actions */}
                <div onClick={(e) => e.stopPropagation()}>
                  <PostActions
                    postId={post.id}
                    postType="adoption"
                    contactWhatsapp={post.contact_whatsapp}
                    contactPhone={post.contact_phone}
                    contactEmail={post.contact_email}
                    isHighlighted={highlights.has(post.id)}
                    onHighlightChange={(highlighted) => {
                      const newHighlights = new Set(highlights);
                      if (highlighted) {
                        newHighlights.add(post.id);
                      } else {
                        newHighlights.delete(post.id);
                      }
                      setHighlights(newHighlights);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron mascotas para adopción</p>
          </div>
        )}
      </main>
    </div>
  );
}