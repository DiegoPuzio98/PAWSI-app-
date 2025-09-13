import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Flag } from "lucide-react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postType: 'adoption' | 'lost' | 'reported' | 'classified';
}

const reportReasons = [
  { value: 'spam', label: 'Spam o contenido repetitivo' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'fake', label: 'Información falsa' },
  { value: 'animal_abuse', label: 'Posible maltrato animal' },
  { value: 'commercial', label: 'Venta comercial no permitida' },
  { value: 'offensive', label: 'Contenido ofensivo' },
  { value: 'personal_data', label: 'Exposición de datos personales' },
  { value: 'other', label: 'Otro motivo' }
];

export function ReportDialog({ open, onOpenChange, postId, postType }: ReportDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast({ title: "Error", description: "Selecciona un motivo para el reporte" });
      return;
    }

    if (reason === 'other' && !description) {
      toast({ title: "Error", description: "Proporciona una descripción para 'Otro motivo'" });
      return;
    }

    setSubmitting(true);
    try {
      // Use the new report-content edge function
      const reportResponse = await supabase.functions.invoke('report-content', {
        body: {
          content_type: postType,
          content_id: postId,
          reason,
          message: description || null,
          reporter_id: user?.id || null,
        }
      });

      if (reportResponse.error) {
        console.error('Report submission error:', reportResponse.error);
        throw reportResponse.error;
      }

      toast({ title: "Reporte enviado", description: "Gracias por ayudar a mantener la comunidad segura." });
      onOpenChange(false);
      setReason("");
      setDescription("");
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({ title: "Error", description: "No se pudo enviar el reporte. Intenta nuevamente." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Reportar publicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Motivo del reporte *</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción {reason === 'other' ? '(requerida)' : '(opcional)'}
            </label>
            <Textarea
              placeholder={reason === 'other' ? "Explica el motivo del reporte..." : "Proporciona más detalles sobre el problema..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required={reason === 'other'}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Los reportes son revisados por moderadores y se toman acciones apropiadas.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !reason}
            variant="destructive"
          >
            {submitting ? "Enviando..." : "Enviar reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}