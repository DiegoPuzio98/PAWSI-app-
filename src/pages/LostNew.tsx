import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { LocationPicker } from "@/components/LocationPicker";
import { uploadFiles } from "@/utils/fileUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import bcrypt from "bcryptjs";

import { speciesList, normalizeSpecies } from "@/utils/species";

export default function LostNew() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [species, setSpecies] = useState<string>("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lostAt, setLostAt] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const genSecret = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % 900000 + 100000).toString();
  };

  const onSubmit = async () => {
    if (!title || !location) {
      toast({ title: "Faltan campos obligatorios", description: "Título y área aproximada son requeridos" });
      return;
    }
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para publicar." });
      return;
    }
    setSubmitting(true);
    try {
      const s = genSecret();
      const owner_secret_hash = await bcrypt.hash(s, 10);
      
      // Upload files if any
      let images: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          images = await uploadFiles(selectedFiles as any);
        } catch (uploadError: any) {
          toast({ title: "Error al subir fotos", description: uploadError.message });
          setSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("lost_posts").insert({
        title,
        species: normalizeSpecies(species),
        breed: breed || null,
        description: description || null,
        location_text: location,
        location_lat: locationLat,
        location_lng: locationLng,
        images,
        contact_whatsapp: whatsapp || null,
        contact_phone: phone || null,
        contact_email: email || null,
        lost_at: lostAt ? new Date(lostAt).toISOString() : null,
        owner_secret_hash,
        status: "active",
        user_id: user?.id,
      });

      if (error) throw error;

      setSecret(s);
      toast({ title: "¡Alerta publicada!", description: "Guarda tu código secreto para cerrar el caso." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al publicar", description: e.message ?? "Inténtalo de nuevo" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Reportar mascota perdida</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Evita direcciones exactas o datos sensibles. Sube solo fotos tuyas o con permiso.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Gata perdida en Centro" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Especie</label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger>
                    <SelectValue placeholder="Especie" />
                  </SelectTrigger>
                   <SelectContent>
                     {speciesList.map((s) => (
                       <SelectItem key={s} value={s}>{t(`species.${s}`)}</SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Raza</label>
                <Input value={breed} onChange={(e) => setBreed(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Área aproximada *</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Barrio / zona" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha/hora de pérdida</label>
                <Input type="datetime-local" value={lostAt} onChange={(e) => setLostAt(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación exacta (opcional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Permite que otros usuarios vean la ubicación aproximada en un mapa
              </p>
              <LocationPicker
                onLocationChange={(lat, lng) => {
                  setLocationLat(lat);
                  setLocationLng(lng);
                }}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fotos</label>
              <FileUpload
                onFilesSelected={(files) => setSelectedFiles(Array.from(files))}
                onFileRemove={(index) => {
                  const newFiles = [...selectedFiles];
                  newFiles.splice(index, 1);
                  setSelectedFiles(newFiles);
                }}
                selectedFiles={selectedFiles}
                disabled={submitting}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="54911..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "Publicando..." : "Publicar alerta"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!secret} onOpenChange={() => setSecret(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guarda este código secreto</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p>Usa este código para marcar el caso como resuelto:</p>
              <p className="text-2xl font-bold text-primary select-all">{secret}</p>
              <p className="text-sm text-muted-foreground">No podremos recuperarlo si lo pierdes.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => (window.location.href = "/lost")}>Ir a perdidos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
