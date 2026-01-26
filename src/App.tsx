import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

// New "Art Gallery" views
import SentenceLanding from "./pages/SentenceLanding";
import PackageDeck from "./pages/PackageDeck";
import BookingSuccess from "./pages/BookingSuccess";

// Existing pages
import Browse from "./pages/Browse";
import VendorProfile from "./pages/VendorProfile";
import PackageDetail from "./pages/PackageDetailNew";
import ProProfile from "./pages/ProProfile";
import BecomePro from "./pages/BecomePro";
import HowItWorks from "./pages/HowItWorks";
import Learn from "./pages/Learn";
import LearnEventPros from "./pages/LearnEventPros";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import AuthEventPro from "./pages/AuthEventPro";
import AuthBooking from "./pages/AuthBooking";
import PostAuth from "./pages/PostAuth";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorOnboarding from "./pages/VendorOnboarding";
import EventProOnboarding from "./pages/EventProOnboarding";
import EventProBestPractices from "./pages/EventProBestPractices";
import Onboarding from "./pages/Onboarding";
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
              {/* New "Art Gallery" Flow */}
              <Route path="/" element={<SentenceLanding />} />
              <Route path="/discover" element={<PackageDeck />} />
              
              {/* Booking Success */}
              <Route path="/booking-success" element={<BookingSuccess />} />
              
              {/* Legacy browse (still accessible) */}
              <Route path="/browse" element={<Browse />} />
              
              <Route path="/vendor/:id" element={<VendorProfile />} />
              <Route path="/pro/:id" element={<ProProfile />} />
              <Route path="/package/:id" element={<PackageDetail />} />
              <Route path="/become-a-pro" element={<BecomePro />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/event-pros" element={<LearnEventPros />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/pro" element={<AuthEventPro />} />
              <Route path="/auth/booking" element={<AuthBooking />} />
              <Route path="/signin" element={<Auth />} />
              <Route path="/post-auth" element={<PostAuth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
              <Route path="/eventpro-onboarding" element={<EventProOnboarding />} />
              <Route path="/eventpro-best-practices" element={<EventProBestPractices />} />
              <Route path="/onboarding" element={<Onboarding />} />
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
