import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapboxPreview } from "@/components/MapboxPreview";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface PostData {
  id: string;
  title: string;
  description?: string;
  species?: string;
  breed?: string;
  age?: string;
  images?: string[];
  location_text: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  lost_at?: string;
  seen_at?: string;
  state?: string;
  status?: string;
  category?: string;
  condition?: string;
  price?: number;
}

interface ContactInfo {
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  store_contact?: string;
}

export default function PostDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [post, setPost] = useState<PostData | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContact, setLoadingContact] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!type || !id) return;

      try {
        let data, error;
        
        switch (type) {
          case 'lost':
            ({ data, error } = await supabase.from('lost_posts').select('*').eq('id', id).eq('status', 'active').single());
            break;
          case 'reported':
            ({ data, error } = await supabase.from('reported_posts').select('*').eq('id', id).eq('status', 'active').single());
            break;
          case 'adoption':
            ({ data, error } = await supabase.from('adoption_posts').select('*').eq('id', id).eq('status', 'active').single());
            break;
          case 'classifieds':
            ({ data, error } = await supabase.from('classifieds').select('*').eq('id', id).eq('status', 'active').single());
            break;
          default:
            throw new Error('Invalid post type');
        }

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del post",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [type, id, navigate, toast]);

  const loadContactInfo = async () => {
    if (!user || !type || !id) {
      toast({
        title: "Autenticación requerida",
        description: "Debes iniciar sesión para ver la información de contacto",
        variant: "destructive",
      });
      return;
    }

    setLoadingContact(true);
    try {
      const { data, error } = await supabase.rpc('get_post_contact_info', {
        post_table: `${type}_posts`,
        post_id: id
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setContactInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de contacto",
        variant: "destructive",
      });
    } finally {
      setLoadingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post no encontrado</h1>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'lost': return 'Perdido';
      case 'reported': return 'Reportado';
      case 'adoption': return 'Adopción';
      case 'classifieds': return 'Clasificado';
      default: return type;
    }
  };

  const getTypeVariant = () => {
    switch (type) {
      case 'lost': return 'destructive';
      case 'reported': return 'default';
      case 'adoption': return 'secondary';
      case 'classifieds': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card className="overflow-hidden">
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="relative h-96 w-full overflow-hidden">
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
              <div className="absolute top-4 left-4">
                <Badge variant={getTypeVariant() as any}>
                  {getTypeLabel()}
                </Badge>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Header without image */}
            {(!post.images || post.images.length === 0) && (
              <div className="mb-4">
                <Badge variant={getTypeVariant() as any} className="mb-2">
                  {getTypeLabel()}
                </Badge>
              </div>
            )}

            {/* Title and basic info */}
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {post.species && (
                <div>
                  <p className="text-sm text-muted-foreground">Especie</p>
                  <p className="font-medium">{t(`species.${post.species}`)}</p>
                </div>
              )}
              {post.breed && (
                <div>
                  <p className="text-sm text-muted-foreground">Raza</p>
                  <p className="font-medium">{post.breed}</p>
                </div>
              )}
              {post.age && (
                <div>
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium">{post.age}</p>
                </div>
              )}
              {post.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{post.category}</p>
                </div>
              )}
              {post.condition && (
                <div>
                  <p className="text-sm text-muted-foreground">Condición</p>
                  <p className="font-medium">{post.condition}</p>
                </div>
              )}
              {post.price && (
                <div>
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="font-medium text-primary">${post.price}</p>
                </div>
              )}
              {post.state && (
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{post.state}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {post.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Descripción</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Location */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Ubicación</h2>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{post.location_text}</span>
              </div>
              {post.location_lat && post.location_lng && (
                <MapboxPreview
                  lat={post.location_lat}
                  lng={post.location_lng}
                  height={300}
                />
              )}
            </div>

            <Separator className="my-6" />

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Publicado: {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              {post.lost_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Perdido: {new Date(post.lost_at).toLocaleDateString()}</span>
                </div>
              )}
              {post.seen_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Visto: {new Date(post.seen_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Contact Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Información de Contacto</h2>
              {!contactInfo ? (
                <Button 
                  onClick={loadContactInfo} 
                  disabled={loadingContact}
                  className="w-full"
                >
                  {loadingContact ? "Cargando..." : "Mostrar información de contacto"}
                </Button>
              ) : (
                <div className="space-y-3">
                  {contactInfo.contact_whatsapp && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(`https://wa.me/${contactInfo.contact_whatsapp.replace(/\D/g, '')}`, '_blank')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp: {contactInfo.contact_whatsapp}
                    </Button>
                  )}
                  {contactInfo.contact_phone && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(`tel:${contactInfo.contact_phone}`, '_blank')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Teléfono: {contactInfo.contact_phone}
                    </Button>
                  )}
                  {contactInfo.contact_email && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(`mailto:${contactInfo.contact_email}`, '_blank')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email: {contactInfo.contact_email}
                    </Button>
                  )}
                  {contactInfo.store_contact && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contacto de tienda:</p>
                      <p className="font-medium">{contactInfo.store_contact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}