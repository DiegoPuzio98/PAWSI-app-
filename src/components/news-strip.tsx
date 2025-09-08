import { useEffect, useState } from "react";
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex gap-3 overflow-x-auto pb-2">
        {posts.map((post) => (
          <Card key={post.id} className="min-w-[280px] bg-card hover:shadow-md transition-shadow overflow-hidden">
            {post.images && post.images.length > 0 && (
              <div className="relative h-32 w-full overflow-hidden">
                <img 
                  src={`https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${post.images[0]}`}
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