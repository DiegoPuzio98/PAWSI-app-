import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigation } from "@/components/navigation";
import { LocationSelector } from "@/components/LocationSelector";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { PawIcon } from "@/components/ui/paw-icon";
import { Mail, Lock, User, AlertCircle, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp && !termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones para crear tu cuenta.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName, { country, province });
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email ya está registrado. Intenta iniciar sesión.');
          } else {
            setError(error.message);
          }
        } else {
          toast({ 
            title: t('auth.checkEmail'), 
            description: t('auth.confirmationSent') 
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email o contraseña incorrectos. Verifica tus datos.');
          } else {
            setError(error.message);
          }
        } else {
          toast({ 
            title: t('auth.welcomeBack'), 
            description: t('auth.signedInSuccess') 
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <PawIcon size={48} />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? 'Crea tu cuenta para gestionar tus publicaciones' : t('auth.subtitle')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nombre para mostrar
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre"
                        className="pl-10"
                        required={isSignUp}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {isSignUp && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Ubicación
                    </label>
                    <LocationSelector
                      country={country}
                      province={province}
                      onCountryChange={setCountry}
                      onProvinceChange={setProvince}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Esto nos ayuda a mostrar publicaciones relevantes para tu área
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="flex items-start gap-2 text-sm mb-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(v) => setTermsAccepted(!!v)}
                      disabled={loading}
                    />
                    <label htmlFor="terms" className="leading-snug text-muted-foreground">
                      Acepto los{' '}
                      <button
                        type="button"
                        onClick={() => setTermsOpen(true)}
                        className="text-primary underline font-medium"
                        disabled={loading}
                      >
                        Términos y Condiciones
                      </button>
                      {' '}de Pawsi
                    </label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading 
                    ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn'))
                    : (isSignUp ? t('auth.signUp') : t('auth.signIn'))
                  }
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                      setCountry("");
                      setProvince("");
                    }}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    {isSignUp ? 'Iniciar sesión' : 'Crear cuenta'}
                  </button>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link to="/">
                  <Button variant="ghost" size="sm" disabled={loading}>
                    Volver al inicio
                  </Button>
                </Link>
              </div>

              <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>TÉRMINOS Y CONDICIONES DE USO DE PAWSI</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-foreground">
                    <p>(Última actualización: 8/9/2025)</p>
                    <p><strong>1. ACEPTACIÓN DE LOS TÉRMINOS</strong><br />Al acceder y utilizar la aplicación Pawsi (en adelante, “la App”), el usuario acepta plenamente estos Términos y Condiciones, junto con la Política de Privacidad. Si el usuario no está de acuerdo, deberá abstenerse de utilizar la App.</p>
                    <p><strong>2. OBJETO DE LA APP</strong><br />Pawsi es una plataforma digital destinada a:<br />• Reportar animales extraviados.<br />• Reportar animales avistados.<br />• Publicar y gestionar procesos de adopción responsable de animales.<br />• Compartir información sobre establecimientos veterinarios y servicios relacionados.<br />• Publicar y comercializar productos y alimentos para animales.<br />Está prohibido el uso de la App para la compraventa o comercialización de animales de cualquier tipo. La App tiene carácter solidario e informativo, y no garantiza la localización, adopción ni disponibilidad de animales o productos.</p>
                    <p><strong>3. REGISTRO Y EDAD DE LOS USUARIOS</strong><br />Para utilizar Pawsi, el usuario debe tener 18 años o más. Los menores de edad solo podrán usar la App con el consentimiento y supervisión expresa de sus padres, tutores o representantes legales. El usuario declara ser plenamente capaz conforme a la legislación vigente para aceptar estos Términos.</p>
                    <p><strong>4. PUBLICACIÓN DE AVISOS Y CONTENIDO</strong><br />Los usuarios podrán publicar: Avisos de animales perdidos o encontrados (con foto, descripción, especie, zona aproximada, fecha y contacto). Avisos de adopción, con información clara y responsable del animal. Información sobre veterinarias o establecimientos relacionados. Productos y alimentos para animales (queda prohibido publicar animales para la venta). Los datos de contacto (email, WhatsApp, teléfono, dirección) son opcionales y, al completarlos, el usuario consiente expresamente que se hagan públicos en la App. Restricciones de contenido: El usuario no debe incluir en los avisos: Domicilios exactos, salvo consentimiento expreso. Rostros de menores de edad y/o terceros sin consentimiento. Patentes de vehículos o información personal ajena sin consentimiento. Contenidos falsos, engañosos, ofensivos, sensibles o ilegales.</p>
                    <p><strong>5. PRIVACIDAD Y PROTECCIÓN DE DATOS</strong><br />Pawsi cumple con la Ley 25.326 de Protección de Datos Personales de Argentina. Los datos se recolectan únicamente para brindar los servicios de la App. Al marcar un aviso como “resuelto”, los datos de contacto del usuario se ocultan automáticamente. El usuario podrá solicitar en cualquier momento el acceso, rectificación o eliminación de sus datos escribiendo a ecomervix@gmail.com. No se garantiza un tiempo de respuesta estimado.</p>
                    <p><strong>6. RESPONSABILIDAD DEL USUARIO</strong><br />El usuario es único responsable por: La veracidad y exactitud de la información publicada. El uso que haga de la App y de las interacciones con otros usuarios. Cumplir con la normativa vigente en materia de bienestar animal, protección de datos y comercio electrónico. Pawsi no se hace responsable por el mal uso que se pueda hacer de la aplicación.</p>
                    <p><strong>7. MODERACIÓN Y SEGURIDAD</strong><br />Pawsi incluye un sistema de “Reportar” para denunciar publicaciones inapropiadas o sospechosas. Se aplican medidas antispam y captcha. Pawsi podrá modificar, suspender o eliminar publicaciones que infrinjan estos Términos o la ley.</p>
                    <p><strong>8. LIMITACIÓN DE RESPONSABILIDAD</strong><br />Pawsi actúa como un espacio de intermediación y no participa en las relaciones, acuerdos ni transacciones entre usuarios. No garantiza la veracidad, exactitud ni disponibilidad de los avisos publicados. Pawsi no será responsable por daños o perjuicios derivados del uso de la App, incluyendo: fraudes, publicaciones falsas, conflictos entre usuarios o falta de resultados.</p>
                    <p><strong>9. PROPIEDAD INTELECTUAL</strong><br />La App, su diseño, logotipos, código y contenidos propios son propiedad de [Hugo Diego Puzio]. El usuario conserva la titularidad de los contenidos que publique, pero otorga a Pawsi una licencia gratuita, mundial y no exclusiva para mostrar y difundir dichos contenidos dentro de la plataforma.</p>
                    <p><strong>10. MODIFICACIONES</strong><br />Pawsi podrá modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigencia desde su publicación en la App.</p>
                    <p><strong>11. JURISDICCIÓN Y LEY APLICABLE</strong><br />Estos Términos se rigen por la legislación de la República Argentina. Cualquier controversia será resuelta por los tribunales ordinarios de la Ciudad de Salta Capital, Argentina, renunciando las partes a cualquier otro fuero o jurisdicción.</p>
                    <p><strong>12. Desarrollo</strong><br />Pawsi fue desarrollada con la herramienta Lovable y contiene las integraciones Resend, Mapbox y Supabase.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}