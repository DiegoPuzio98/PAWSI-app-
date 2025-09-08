import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import AuthPage from "./pages/auth";
import ReportedPets from "./pages/ReportedPets";
import LostPets from "./pages/LostPets";
import Marketplace from "./pages/Marketplace";
import Adoptions from "./pages/Adoptions";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import ReportedNew from "./pages/ReportedNew";
import LostNew from "./pages/LostNew";
import MarketplaceNew from "./pages/MarketplaceNew";
import AdoptionsNew from "./pages/AdoptionsNew";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthGuard requireAuth={false}><AuthPage /></AuthGuard>} />
            <Route path="/reported" element={<ReportedPets />} />
            <Route path="/reported/new" element={<ReportedNew />} />
            <Route path="/lost" element={<LostPets />} />
            <Route path="/lost/new" element={<LostNew />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/new" element={<MarketplaceNew />} />
            <Route path="/adoptions" element={<Adoptions />} />
            <Route path="/adoptions/new" element={<AdoptionsNew />} />
            <Route path="/support" element={<Support />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
