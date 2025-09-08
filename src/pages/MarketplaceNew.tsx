import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const categories = ["food", "toys", "accessories", "medicine", "services", "other"] as const;

export default function MarketplaceNew() {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [storeContact, setStoreContact] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!title || !category) {
      toast({ title: "Faltan campos obligatorios", description: "Título y categoría son requeridos" });
      return;
    }
    setSubmitting(true);
    try {
      const images = imagesText
        .split(/\n|,/) 
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error } = await supabase.from("classifieds").insert({
        title,
        category,
        condition: condition || null,
        description: description || null,
        price: price ? Number(price) : null,
        images,
        location_text: location || null,
        contact_whatsapp: whatsapp || null,
        contact_email: email || null,
        store_contact: storeContact || null,
        status: "active",
      });

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "Tu anuncio fue creado" });
      window.location.href = "/marketplace";
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
        <h1 className="text-3xl font-bold text-primary mb-4">Publicar en Marketplace</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Prohibida la venta de animales. Usa lugares públicos y seguros para encuentros.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Correa reforzada" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <Input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Nuevo/Usado" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Barrio / zona" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fotos (URLs, una por línea)</label>
              <Textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={4} placeholder="https://...\nhttps://..." />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="54911..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contacto de tienda</label>
                <Input value={storeContact} onChange={(e) => setStoreContact(e.target.value)} placeholder="@mitienda" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
