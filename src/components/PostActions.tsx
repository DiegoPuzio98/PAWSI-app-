import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Flag, MessageCircle } from "lucide-react";
import { ReportDialog } from "./ReportDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PostActionsProps {
  postId: string;
  postType: 'adoption' | 'lost' | 'reported' | 'classified';
  contactWhatsapp?: string;
  isHighlighted?: boolean;
  onHighlightChange?: (highlighted: boolean) => void;
}

export function PostActions({ 
  postId, 
  postType, 
  contactWhatsapp, 
  isHighlighted, 
  onHighlightChange 
}: PostActionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [highlightLoading, setHighlightLoading] = useState(false);

  const handleHighlight = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para guardar publicaciones" });
      return;
    }

    setHighlightLoading(true);
    try {
      if (isHighlighted) {
        // Remove highlight
        const { error } = await supabase
          .from('user_highlights')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .eq('post_type', postType);
        
        if (error) throw error;
        onHighlightChange?.(false);
        toast({ title: "Publicación eliminada de guardados" });
      } else {
        // Add highlight
        const { error } = await supabase
          .from('user_highlights')
          .insert({
            user_id: user.id,
            post_id: postId,
            post_type: postType
          });
        
        if (error) throw error;
        onHighlightChange?.(true);
        toast({ title: "Publicación guardada" });
      }
    } catch (error: any) {
      console.error('Error managing highlight:', error);
      toast({ title: "Error", description: "No se pudo actualizar el guardado" });
    } finally {
      setHighlightLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Red CONTACT button for WhatsApp */}
      {contactWhatsapp && (
        <Button 
          size="sm" 
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          asChild
        >
          <a href={`https://wa.me/${contactWhatsapp}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-1" />
            CONTACTAR
          </a>
        </Button>
      )}

      {/* Highlight button */}
      <Button 
        size="sm" 
        variant="outline"
        onClick={handleHighlight}
        disabled={highlightLoading}
      >
        <Heart 
          className={`h-4 w-4 mr-1 ${isHighlighted ? 'fill-current text-primary' : ''}`} 
        />
        {isHighlighted ? 'Guardado' : 'Guardar'}
      </Button>

      {/* Report button */}
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setReportOpen(true)}
      >
        <Flag className="h-4 w-4 mr-1" />
        Reportar
      </Button>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        postId={postId}
        postType={postType}
      />
    </div>
  );
}