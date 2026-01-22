import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import Browse from "./pages/Browse";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import VendorProfile from "./pages/VendorProfile";
import PackageDetail from "./pages/PackageDetail";
import BecomePro from "./pages/BecomePro";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorOnboarding from "./pages/VendorOnboarding";
import EventProOnboarding from "./pages/EventProOnboarding";
import Onboarding from "./pages/Onboarding";
import MarketSpaceOnboarding from "./pages/MarketSpaceOnboarding";
import MarketSpaceDashboard from "./pages/MarketSpaceDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GoogleMapsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Browse />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/market/:id" element={<MarketDetail />} />
              <Route path="/vendor/:id" element={<VendorProfile />} />
              <Route path="/package/:id" element={<PackageDetail />} />
              <Route path="/become-a-pro" element={<BecomePro />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signin" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
              <Route path="/eventpro-onboarding" element={<EventProOnboarding />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/marketspace-onboarding" element={<MarketSpaceOnboarding />} />
              <Route path="/marketspace-dashboard" element={<MarketSpaceDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GoogleMapsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
