import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { MapboxPicker } from "@/components/MapboxPicker";
import { ColorSelector } from "@/components/ColorSelector";
import { BreedSelector } from "@/components/BreedSelector";
import { uploadFiles } from "@/utils/fileUpload";
import bcrypt from "bcryptjs";

import { speciesList, normalizeSpecies } from "@/utils/species";

export default function ReportedNew() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [species, setSpecies] = useState<string>("");
  const [breed, setBreed] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<string>("seen");

  // Captcha
  const [captchaQuestion, setCaptchaQuestion] = useState<{a: number, b: number, answer: number}>({ a: 0, b: 0, answer: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const genSecret = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % 900000 + 100000).toString(); // 6 digits
  };

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ a, b, answer: a + b });
    setCaptchaAnswer("");
    setCaptchaValid(false);
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const onSubmit = async () => {
    if (!title || !location) {
      toast({ title: "Faltan campos obligatorios", description: "Título y área aproximada son requeridos" });
      return;
    }
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para publicar." });
      return;
    }
    if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
      toast({ title: "Captcha incorrecto", description: "Verifica la respuesta del cálculo matemático" });
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

      const normalizedSpecies = normalizeSpecies(species);
      if (!normalizedSpecies) {
        toast({ title: "Selecciona una especie", description: "Debes elegir una especie válida." });
        setSubmitting(false);
        return;
      }
      if (normalizedSpecies === 'fish') {
        toast({ title: "Especie no permitida", description: "Peces no están permitidos en esta sección." });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("reported_posts").insert({
        title,
        species: normalizedSpecies === 'dog' ? 'canes' : normalizedSpecies === 'cat' ? 'felinos' : normalizedSpecies === 'bird' ? 'aves' : 'roedores',
        breed: breed || null,
        colors,
        description: description || null,
        location_text: location,
        location_lat: locationLat,
        location_lng: locationLng,
        images,
        contact_whatsapp: whatsapp || null,
        contact_phone: phone || null,
        contact_email: email || null,
        state,
        owner_secret_hash,
        status: "active",
        user_id: user?.id,
      });

      if (error) throw error;

      setSecret(s);
      toast({ title: "¡Reporte publicado!", description: "Guarda tu código secreto para cerrar el caso." });
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
        <h1 className="text-3xl font-bold text-primary mb-4">Reportar avistamiento</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Evita direcciones exactas o datos sensibles. Sube solo fotos tuyas o con permiso.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Perro café visto en el parque" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Especie</label>
                 <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.species')} />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesList.filter(s => s !== 'fish').map((s) => (
                      <SelectItem key={s} value={s}>{t(`species.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Raza</label>
                <BreedSelector 
                  species={species}
                  breed={breed}
                  onBreedChange={setBreed}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Colores</label>
              <ColorSelector 
                selectedColors={colors}
                onColorsChange={setColors}
                maxColors={4}
              />
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
                <label className="block text-sm font-medium mb-1">Estado del avistamiento</label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seen">Visto</SelectItem>
                    <SelectItem value="injured">Herido</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación exacta (opcional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Permite que otros usuarios vean la ubicación aproximada en un mapa
              </p>
              <MapboxPicker
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verificación anti-spam *</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">¿Cuánto es {captchaQuestion.a} + {captchaQuestion.b}?</span>
                  <Input 
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value);
                      setCaptchaValid(parseInt(e.target.value) === captchaQuestion.answer);
                    }}
                    className="w-20"
                    placeholder="="
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateCaptcha}>
                    Nuevo
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onSubmit} disabled={submitting || !captchaValid}>
                  {submitting ? "Publicando..." : "Publicar avistamiento"}
                </Button>
              </div>
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
              <Button onClick={() => (window.location.href = "/reported")}>Ir a avistamientos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
