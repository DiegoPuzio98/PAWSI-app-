import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { NewsStrip } from "@/components/news-strip";
import { Camera, AlertTriangle, Heart, ShoppingCart } from "lucide-react";
import { PawIcon } from "@/components/ui/paw-icon";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <PawIcon size={64} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">{t('home.welcome')}</h1>
          <p className="text-muted-foreground">{t('home.subtitle')}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t('home.animalSighted')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('home.animalSightedDesc')}</p>
                <Link to="/reported/new">
                  <Button className="w-full">{t('home.reportSighting')}</Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{t('home.lostPet')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t('home.lostPetDesc')}</p>
                <Link to="/lost/new">
                  <Button variant="destructive" className="w-full">{t('home.postAlert')}</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/adoptions">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Heart className="h-5 w-5" />
              <span className="text-sm">{t('home.adoptions')}</span>
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">{t('home.buySell')}</span>
            </Button>
          </Link>
        </div>

        {/* News Strip */}
        <NewsStrip />
      </main>
    </div>
  );
};

export default Index;
