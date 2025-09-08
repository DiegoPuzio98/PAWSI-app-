import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Post {
  id: string;
  title: string;
  location_text: string;
  created_at: string;
  species?: string;
  images?: string[];
  type: 'lost' | 'reported';
}

export const NewsStrip = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        // Fetch latest lost posts
        const { data: lostPosts } = await supabase
          .from('lost_posts')
          .select('id, title, location_text, created_at, species, images')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch latest reported posts
        const { data: reportedPosts } = await supabase
          .from('reported_posts')
          .select('id, title, location_text, created_at, species, images')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        const combinedPosts: Post[] = [
          ...(lostPosts?.map(post => ({ ...post, type: 'lost' as const })) || []),
          ...(reportedPosts?.map(post => ({ ...post, type: 'reported' as const })) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
         .slice(0, 6);

        setPosts(combinedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || posts.length === 0) return;
    
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    const step = 0.5; // pixels per frame
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    
    const scroll = () => {
      if (isPaused) return;
      
      scrollAmount += step;
      if (scrollAmount >= maxScroll) {
        scrollAmount = 0; // Reset to beginning
      }
      
      scrollContainer.scrollLeft = scrollAmount;
      requestAnimationFrame(scroll);
    };
    
    const animationId = requestAnimationFrame(scroll);
    
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, posts]);

  if (loading) {
    return (
      <div className="w-full py-4">
        <h2 className="text-lg font-semibold mb-3 text-primary">{t('home.latestNews')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[280px] h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <h2 className="text-lg font-semibold mb-3 text-primary">{t('home.latestNews')}</h2>
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className="min-w-[280px] bg-card hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            onClick={() => navigate(`/${post.type}/${post.id}`)}
          >
            {post.images && post.images.length > 0 && (
              <div className="relative h-32 w-full overflow-hidden">
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
                <div className="absolute top-2 left-2">
                  <Badge variant={post.type === 'lost' ? 'destructive' : 'default'}>
                    {post.type === 'lost' ? t('status.lost') : t('status.reported')}
                  </Badge>
                </div>
                {post.species && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-background/80">
                      {t(`species.${post.species}`)}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <div className="p-3">
              {(!post.images || post.images.length === 0) && (
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={post.type === 'lost' ? 'destructive' : 'default'}>
                    {post.type === 'lost' ? t('status.lost') : t('status.reported')}
                  </Badge>
                  {post.species && (
                    <Badge variant="outline">{t(`species.${post.species}`)}</Badge>
                  )}
                </div>
              )}
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{post.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{post.location_text}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};