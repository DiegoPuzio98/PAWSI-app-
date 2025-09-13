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
            <p className="mb-4">
              Para mayor seguridad, recomendamos usar el sistema de mensajería interno de Pawsi 
              antes de compartir información personal directa.
            </p>
            <h3 className="text-lg font-bold mb-2">Sistema de Moderación y Seguridad</h3>
            <p className="mb-4">
              Los chats y publicaciones reportados pueden ser revisados por el sistema de moderación de Pawsi, 
              únicamente con fines de seguridad y cumplimiento de las normas comunitarias. Los usuarios serán 
              notificados si su contenido es eliminado; la repetición de infracciones puede derivar en la 
              suspensión o eliminación de la cuenta.
            </p>
            <p className="mb-4">
              Nos reservamos el derecho de eliminar contenido que consideremos inapropiado, ofensivo o que 
              viole nuestras normas comunitarias. Esto incluye, pero no se limita a: spam, contenido falso, 
              maltrato animal, ventas comerciales no autorizadas o exposición indebida de datos personales.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}