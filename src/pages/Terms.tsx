import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Términos y Condiciones - Pawsi</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="mb-4">
              Pawsi cuenta con un sistema interno de mensajería anónimo para garantizar la seguridad del usuario. 
              Las opciones de compartir números de teléfono, direcciones exactas y fotografías son opcionales, 
              y al proporcionarlas, el usuario consiente que dicha información personal sea pública.
            </p>
            <p className="mb-4">
              Al usar esta plataforma, aceptas que toda la información proporcionada voluntariamente 
              (incluyendo contactos, ubicaciones y fotos) será visible públicamente para otros usuarios.
            </p>
            <p>
              Para mayor seguridad, recomendamos usar el sistema de mensajería interno de Pawsi 
              antes de compartir información personal directa.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}