import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.reported': 'Mascotas Reportadas',
    'nav.lost': 'Mascotas Perdidas',
    'nav.marketplace': 'Compra y Venta',
    'nav.adoptions': 'Adopciones',
    'nav.support': 'Soporte',
    'nav.dashboard': 'Datos de cuenta',
    'nav.saved': 'Guardados',
    'nav.profile': 'Perfil',
    
    // Homepage
    'home.welcome': 'Bienvenido a Pawsi',
    'home.subtitle': 'Ayuda a reunir mascotas con sus familias',
    'home.animalSighted': 'Animal Avistado',
    'home.animalSightedDesc': 'Reporta una mascota que has visto',
    'home.reportSighting': 'Reportar Avistamiento',
    'home.lostPet': 'Mascota Perdida',
    'home.lostPetDesc': 'Publica una alerta de mascota perdida',
    'home.postAlert': 'Publicar Alerta',
    'home.adoptions': 'Adopciones',
    'home.buySell': 'Compra y Venta',
    'home.latestNews': 'Últimas Noticias',
    
    // Authentication
    'auth.welcome': 'Bienvenido a Pawsi',
    'auth.subtitle': 'Inicia sesión para ayudar a reunir mascotas con sus familias',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.creatingAccount': 'Creando cuenta...',
    'auth.checkEmail': 'Revisa tu correo',
    'auth.confirmationSent': 'Te hemos enviado un enlace de confirmación para completar tu registro.',
    'auth.welcomeBack': '¡Bienvenido de vuelta!',
    'auth.signedInSuccess': 'Has iniciado sesión exitosamente.',
    'auth.error': 'Error',
    'auth.signOut': 'Salir',
    
    // Forms
    'form.title': 'Título',
    'form.species': 'Especie',
    'form.breed': 'Raza',
    'form.description': 'Descripción',
    'form.location': 'Ubicación',
    'form.contact': 'Contacto',
    'form.whatsapp': 'WhatsApp',
    'form.phone': 'Teléfono',
    'form.email': 'Correo',
    'form.images': 'Imágenes',
    'form.submit': 'Enviar',
    'form.cancel': 'Cancelar',
    
    // Species
    'species.dogs': 'Perros',
    'species.cats': 'Gatos',
    'species.birds': 'Aves',
    'species.rodents': 'Roedores',
    'species.fish': 'Peces',
    
    // Status
    'status.lost': 'Perdida',
    'status.reported': 'Reportada',
    'status.active': 'Activa',
    'status.resolved': 'Resuelta',
    'status.seen': 'Visto',
    'status.injured': 'Herido',
    'status.sick': 'Enfermo',
    'status.dead': 'Sin vida',
    'status.other': 'Otro',
    
    // Actions
    'action.search': 'Buscar',
    'action.filter': 'Filtrar',
    'action.report': 'Reportar',
    'action.markResolved': 'Marcar como Resuelta',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    
    // Disclaimers
    'disclaimer.animalSales': 'ESTÁ PROHIBIDO USAR ESTA SECCIÓN PARA VENDER ANIMALES.',
    'disclaimer.platform': 'Esta plataforma es colaborativa; se recomienda reunirse en lugares públicos y seguros.',
    'disclaimer.privacy': 'Privacidad por defecto: evita direcciones exactas, placas de matrícula o rostros de menores.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.reported': 'Reported Pets',
    'nav.lost': 'Lost Pets',
    'nav.marketplace': 'Buy & Sell',
    'nav.adoptions': 'Adoptions',
    'nav.support': 'Support',
    'nav.dashboard': 'Account data',
    'nav.saved': 'Saved',
    'nav.profile': 'Profile',
    
    // Homepage
    'home.welcome': 'Welcome to Pawsi',
    'home.subtitle': 'Help reunite pets with their families',
    'home.animalSighted': 'Animal Sighted',
    'home.animalSightedDesc': 'Report a pet you\'ve seen',
    'home.reportSighting': 'Report Sighting',
    'home.lostPet': 'Lost Pet',
    'home.lostPetDesc': 'Post a missing pet alert',
    'home.postAlert': 'Post Alert',
    'home.adoptions': 'Adoptions',
    'home.buySell': 'Buy & Sell',
    'home.latestNews': 'Latest News',
    
    // Authentication
    'auth.welcome': 'Welcome to Pawsi',
    'auth.subtitle': 'Sign in to help reunite pets with their families',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.checkEmail': 'Check your email',
    'auth.confirmationSent': 'We\'ve sent you a confirmation link to complete your registration.',
    'auth.welcomeBack': 'Welcome back!',
    'auth.signedInSuccess': 'You\'ve been successfully signed in.',
    'auth.error': 'Error',
    'auth.signOut': 'Sign out',
    
    // Forms
    'form.title': 'Title',
    'form.species': 'Species',
    'form.breed': 'Breed',
    'form.description': 'Description',
    'form.location': 'Location',
    'form.contact': 'Contact',
    'form.whatsapp': 'WhatsApp',
    'form.phone': 'Phone',
    'form.email': 'Email',
    'form.images': 'Images',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    
    // Species
    'species.dogs': 'Dogs',
    'species.cats': 'Cats',
    'species.birds': 'Birds',
    'species.rodents': 'Rodents',
    'species.fish': 'Fish',
    
    // Status
    'status.lost': 'Lost',
    'status.reported': 'Reported',
    'status.active': 'Active',
    'status.resolved': 'Resolved',
    'status.seen': 'Seen',
    'status.injured': 'Injured',
    'status.sick': 'Sick',
    'status.dead': 'Deceased',
    'status.other': 'Other',
    
    // Actions
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.report': 'Report',
    'action.markResolved': 'Mark as Resolved',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    
    // Disclaimers
    'disclaimer.animalSales': 'IT IS FORBIDDEN TO USE THIS SECTION TO SELL ANIMALS.',
    'disclaimer.platform': 'This platform is collaborative; meeting in safe, public places is recommended.',
    'disclaimer.privacy': 'Privacy by default: avoid exact addresses, license plates, or faces of minors.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es'); // Default to Spanish

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}