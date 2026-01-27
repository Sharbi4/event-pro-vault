import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SentenceBuilder } from '@/components/landing/SentenceBuilder';
import { RevealButton } from '@/components/landing/RevealButton';
import { BackgroundSlideshow } from '@/components/landing/BackgroundSlideshow';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, LogOut, LayoutDashboard, MessageCircle, Loader2 } from 'lucide-react';
import { ModeSwitcher } from '@/components/layout/ModeSwitcher';
import { ProfileTypeModal } from '@/components/layout/ProfileTypeModal';
import logo from '@/assets/eventpro-logo.png';

export default function SentenceLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [eventType, setEventType] = useState<string>('');
  const [location_, setLocation] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>();
  const [isComplete, setIsComplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userInitial, setUserInitial] = useState<string>('U');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const complete = Boolean(eventType && location_ && date);
    setIsComplete(complete);
  }, [eventType, location_, date]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('profiles')
        .select('first_name, display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setUserInitial(data.first_name?.[0] || data.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U');
        setUserAvatarUrl(data.avatar_url);
      } else {
        setUserInitial(user.email?.[0]?.toUpperCase() || 'U');
      }
    };
    fetchProfile();
  }, [user]);

  const handleReveal = () => {
    setIsSearching(true);
    
    const params = new URLSearchParams();
    if (eventType) params.set('event', eventType);
    if (location_) params.set('location', location_);
    if (date) params.set('date', date.toISOString().split('T')[0]);
    
    // Small delay for visual feedback
    setTimeout(() => {
      navigate(`/discover?${params.toString()}`);
    }, 500);
  };

  const navLinkClass = (path: string) =>
    `text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
      location.pathname === path
        ? 'text-foreground bg-secondary'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Cinematic Background Slideshow */}
      <BackgroundSlideshow isComplete={isComplete} interval={7000} />

      {/* Search Loading Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 border-2 border-primary/30 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 w-20 h-20 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Finding perfect matches...
                </h3>
                <p className="text-muted-foreground text-sm">
                  Searching {eventType ? eventType.toLowerCase() + ' services' : 'all services'}
                  {location_ && ` in ${location_}`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div 
        className="relative z-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The Sentence */}
        <div className="text-center mb-16">
          <SentenceBuilder
            eventType={eventType}
            location={location_}
            date={date}
            onEventTypeChange={setEventType}
            onLocationChange={setLocation}
            onDateChange={setDate}
          />
        </div>

        {/* Reveal Button - fades in when complete */}
        <AnimatePresence>
          {isComplete && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <RevealButton onClick={handleReveal} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Top Navigation Bar - Logo aligned with Actions */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/" className="block transition-transform duration-200 hover:scale-105">
              <img 
                src={logo} 
                alt="Event Pro" 
                className="h-32 md:h-40 w-auto drop-shadow-md"
              />
            </Link>
          </motion.div>

          {/* Top Right Actions */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary/50 transition-colors">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={userAvatarUrl || undefined} alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="darkShine" 
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setProfileModalOpen(true)}
              >
                Become an Event Pro
              </Button>
            )}

            {/* Hamburger Menu */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {user ? (
                    <>
                      <div className="px-2 pb-3">
                        <ModeSwitcher compact />
                      </div>
                      <div className="h-px bg-border my-2" />
                      <Link 
                        to="/" 
                        className={navLinkClass('/')}
                        onClick={() => setMenuOpen(false)}
                      >
                        Browse
                      </Link>
                      <Link 
                        to="/faq" 
                        className={navLinkClass('/faq')}
                        onClick={() => setMenuOpen(false)}
                      >
                        FAQ
                      </Link>
                      <button 
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                        onClick={() => {
                          setMenuOpen(false);
                          window.open('https://support.zendesk.com', '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Us
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/auth" 
                        onClick={() => setMenuOpen(false)}
                        className="text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        Sign In
                      </Link>
                      <button 
                        className="text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                        onClick={() => {
                          setMenuOpen(false);
                          setProfileModalOpen(true);
                        }}
                      >
                        Create a Free Profile
                      </button>
                      <div className="h-px bg-border my-2" />
                      <Link 
                        to="/" 
                        className={navLinkClass('/')}
                        onClick={() => setMenuOpen(false)}
                      >
                        Browse
                      </Link>
                      <Link 
                        to="/learn" 
                        className={navLinkClass('/learn')}
                        onClick={() => setMenuOpen(false)}
                      >
                        Learn More
                      </Link>
                      <Link 
                        to="/faq" 
                        className={navLinkClass('/faq')}
                        onClick={() => setMenuOpen(false)}
                      >
                        FAQ
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </motion.div>
        </div>
      </div>


      <ProfileTypeModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  );
}
