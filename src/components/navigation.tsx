import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Camera, AlertTriangle, ShoppingCart, Heart, Phone, LogOut, User, Settings } from "lucide-react";
import { PawIcon } from "@/components/ui/paw-icon";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Remove menuItems as we'll dynamically generate them with translations

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: t('nav.home'), path: "/" },
    { icon: Camera, label: t('nav.reported'), path: "/reported" },
    { icon: AlertTriangle, label: t('nav.lost'), path: "/lost" },
    { icon: ShoppingCart, label: t('nav.marketplace'), path: "/marketplace" },
    { icon: Heart, label: t('nav.adoptions'), path: "/adoptions" },
    { icon: Phone, label: t('nav.support'), path: "/support" },
  ];

  const authMenuItems = [
    { icon: User, label: "Dashboard", path: "/dashboard" },
    { icon: Settings, label: "Perfil", path: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <PawIcon size={32} />
          <span className="text-2xl font-bold text-primary">Pawsi</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {!isAuthenticated ? (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                {t('auth.signIn')}
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-4 mt-8">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  {authMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};