import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

// New "Art Gallery" views
import SentenceLanding from "./pages/SentenceLanding";
import Index from "./pages/Index";
import PackageDeck from "./pages/PackageDeck";
import BookingSuccess from "./pages/BookingSuccess";
import BookingDetail from "./pages/BookingDetail";

// Existing pages
import Browse from "./pages/Browse";
import VendorProfile from "./pages/VendorProfile";
import PackageDetail from "./pages/PackageDetailNew";
import ProProfile from "./pages/ProProfile";
import BecomePro from "./pages/BecomePro";
import HowItWorks from "./pages/HowItWorks";
import BookOrGetBooked from "./pages/BookOrGetBooked";
import Learn from "./pages/Learn";
import LearnEventPros from "./pages/LearnEventPros";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
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
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import VendorTerms from "./pages/VendorTerms";
import CancellationPolicy from "./pages/CancellationPolicy";
import { CookieConsentBanner } from "./components/shared/CookieConsentBanner";
import { NewsletterSideTab } from "./components/marketing/NewsletterSideTab";
import { GAPageTracker } from "./components/analytics/GAPageTracker";
import NotFound from "./pages/NotFound";
import CityCategory from "./pages/CityCategory";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminVendorOutreach from "./pages/AdminVendorOutreach";
import AdminSupport from "./pages/AdminSupport";
import BookingStatus from "./pages/BookingStatus";
import PrivatePackageReview from "./pages/PrivatePackageReview";
import ReferralRedirect from "./pages/ReferralRedirect";
import { LegacyRedirect } from "./components/routing/LegacyRedirect";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GoogleMapsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GAPageTracker />
            <CookieConsentBanner />
            <NewsletterSideTab />
            <Routes>
              {/* Search-first homepage */}
              <Route path="/" element={<Index />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              {/* Legacy sentence-builder landing */}
              <Route path="/planner" element={<SentenceLanding />} />
              <Route path="/discover" element={<PackageDeck />} />
              
              {/* Booking Success */}
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/bookings/:id" element={<BookingDetail />} />
              
              {/* Legacy browse (still accessible) */}
              <Route path="/browse" element={<Browse />} />
              
              <Route path="/pro/:id" element={<ProProfile />} />
              <Route path="/eventpro/:username" element={<ProProfile />} />
              <Route path="/package/:id" element={<PackageDetail />} />
              <Route path="/become-a-pro" element={<BecomePro />} />
              <Route path="/how-it-works" element={<BookOrGetBooked />} />
              <Route path="/book-or-get-booked" element={<BookOrGetBooked />} />
              <Route path="/how-it-works-old" element={<HowItWorks />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/event-pros" element={<LearnEventPros />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/pro" element={<AuthEventPro />} />
              <Route path="/auth/booking" element={<AuthBooking />} />
              <Route path="/signin" element={<Auth />} />
              <Route path="/post-auth" element={<PostAuth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Legacy: redirect old vendor dashboard/onboarding to new Event Pro routes */}
              <Route path="/vendor-dashboard" element={<LegacyRedirect to="/dashboard" />} />
              <Route path="/vendor-onboarding" element={<LegacyRedirect to="/eventpro-onboarding" />} />
              <Route path="/eventpro-onboarding" element={<EventProOnboarding />} />
              <Route path="/eventpro-best-practices" element={<EventProBestPractices />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/vendor-terms" element={<VendorTerms />} />
              <Route path="/cancellation" element={<CancellationPolicy />} />
              {/* Admin routes */}
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/vendor-outreach" element={<AdminVendorOutreach />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              {/* Booking Status Lookup */}
              <Route path="/booking-status" element={<BookingStatus />} />
              <Route path="/private-package/:id" element={<PrivatePackageReview />} />
              {/* Referral / Share Kit redirect */}
              <Route path="/r/:code" element={<ReferralRedirect />} />
              {/* SEO City/Category landing pages */}
              <Route path="/:citySlug/:categorySlug" element={<CityCategory />} />

              {/* ===== Legacy URL aliases (preserve old bookmarks & external links) ===== */}
              <Route path="/vendor/:id" element={<LegacyRedirect to="/pro/:id" />} />
              <Route path="/vendors/:id" element={<LegacyRedirect to="/pro/:id" />} />
              <Route path="/vendors" element={<LegacyRedirect to="/browse" />} />
              <Route path="/become-a-vendor" element={<LegacyRedirect to="/become-a-pro" />} />
              <Route path="/learn/vendors" element={<LegacyRedirect to="/learn/event-pros" />} />
              <Route path="/auth/vendor" element={<LegacyRedirect to="/auth/pro" />} />
              <Route path="/services" element={<LegacyRedirect to="/browse" />} />
              <Route path="/browse-services" element={<LegacyRedirect to="/browse" />} />

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
