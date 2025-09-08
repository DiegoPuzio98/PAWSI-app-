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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}