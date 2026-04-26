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
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, LogOut, LayoutDashboard, MessageCircle, Loader2, Mail, PlusCircle, HelpCircle, BookOpen, Search } from 'lucide-react';
import { ModeSwitcher } from '@/components/layout/ModeSwitcher';
import { ProfileTypeModal } from '@/components/layout/ProfileTypeModal';
import { supabase } from '@/integrations/supabase/client';
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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isEventPro, setIsEventPro] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const complete = Boolean(eventType && location_ && date);
    setIsComplete(complete);
  }, [eventType, location_, date]);

  // Fetch unread message count for logged-in users
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadMessageCount(0);
        return;
      }
      
      const { data: vendorConversations } = await supabase
        .from('conversations')
        .select('vendor_unread_count')
        .eq('vendor_user_id', user.id);
      
      const { data: clientConversations } = await supabase
        .from('conversations')
        .select('client_unread_count')
        .eq('client_user_id', user.id);
      
      const vendorUnread = vendorConversations?.reduce((sum, c) => sum + (c.vendor_unread_count || 0), 0) || 0;
      const clientUnread = clientConversations?.reduce((sum, c) => sum + (c.client_unread_count || 0), 0) || 0;
      
      setUnreadMessageCount(vendorUnread + clientUnread);
    };
    
    fetchUnreadCount();
  }, [user]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsEventPro(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('first_name, display_name, avatar_url, is_vendor')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setUserInitial(data.first_name?.[0] || data.display_name?.[0] || user.email?.[0]?.toUpperCase() || 'U');
        setUserAvatarUrl(data.avatar_url);
        setIsEventPro(data.is_vendor === true);
        setDisplayName(data.display_name || data.first_name || null);
      } else {
        setUserInitial(user.email?.[0]?.toUpperCase() || 'U');
        setIsEventPro(false);
        setDisplayName(null);
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
      {/* Rainbow Gradient Border - ChatGPT Style */}
      <AnimatePresence>
        {isSearching && (
          <>
            {/* Rainbow gradient border around the entire viewport */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 pointer-events-none"
            >
              {/* Top border */}
              <div className="absolute top-0 left-0 right-0 h-1 rainbow-gradient-animate" />
              {/* Bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 rainbow-gradient-animate" />
              {/* Left border */}
              <div className="absolute top-0 left-0 bottom-0 w-1 rainbow-gradient-animate-vertical" />
              {/* Right border */}
              <div className="absolute top-0 right-0 bottom-0 w-1 rainbow-gradient-animate-vertical" />
              
              {/* Corner glow effects */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent blur-xl" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 via-transparent to-transparent blur-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/20 via-transparent to-transparent blur-xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/20 via-transparent to-transparent blur-xl" />
            </motion.div>
            
            {/* Center loading content */}
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
                {/* Rainbow gradient spinner */}
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 rounded-full rainbow-gradient-border"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
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
          </>
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
      <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-8 py-0 md:py-2">
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
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background overflow-hidden">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <motion.nav 
                  className="flex flex-col gap-1 mt-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.1,
                      }
                    }
                  }}
                >
                  {user ? (
                    <>
                      {/* User greeting header */}
                      <motion.div 
                        className="px-2 pb-3 flex items-center gap-3"
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
                        }}
                      >
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarImage src={userAvatarUrl || undefined} alt={displayName || 'User'} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {displayName || user.email?.split('@')[0] || 'Welcome'}
                          </p>
                          {isEventPro && (
                            <p className="text-xs text-primary font-medium">Event Pro</p>
                          )}
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="px-2 pb-3"
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
                        }}
                      >
                        <ModeSwitcher compact />
                      </motion.div>
                      
                      <motion.div 
                        className="h-px bg-border my-2"
                        variants={{
                          hidden: { opacity: 0, scaleX: 0 },
                          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.3 } }
                        }}
                      />
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/browse" 
                          className={navLinkClass('/browse')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <Search className="w-4 h-4 mr-2 inline" />
                          Browse
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/dashboard" 
                          className={navLinkClass('/dashboard')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2 inline" />
                          Dashboard
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link
                          to="/dashboard?tab=messages" 
                          className="flex items-center justify-between text-sm font-medium py-3 px-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Messages
                          </span>
                          {unreadMessageCount > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                            </Badge>
                          )}
                        </Link>
                      </motion.div>
                      
                      {isEventPro && (
                        <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                          <Link 
                            to="/vendor-dashboard?tab=listings&action=create" 
                            className="flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            onClick={() => setMenuOpen(false)}
                          >
                            <PlusCircle className="w-4 h-4" />
                            Create Package
                          </Link>
                        </motion.div>
                      )}
                      
                      <motion.div 
                        className="h-px bg-border my-2"
                        variants={{
                          hidden: { opacity: 0, scaleX: 0 },
                          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.3 } }
                        }}
                      />
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link
                          to="/faq" 
                          className={navLinkClass('/faq')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <HelpCircle className="w-4 h-4 mr-2 inline" />
                          FAQ
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/blog" 
                          className={navLinkClass('/blog')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 mr-2 inline" />
                          Blog
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/contact"
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors w-full"
                          onClick={() => setMenuOpen(false)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contact Us
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Welcome header for guests */}
                      <motion.div 
                        className="px-2 pb-3"
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
                        }}
                      >
                        <p className="text-lg font-semibold text-foreground">Welcome!</p>
                        <p className="text-sm text-muted-foreground">Find the perfect pros for your event</p>
                      </motion.div>
                      
                      <motion.div 
                        className="h-px bg-border my-2"
                        variants={{
                          hidden: { opacity: 0, scaleX: 0 },
                          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.3 } }
                        }}
                      />
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/auth" 
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 rotate-180" />
                          Sign In
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <button 
                          className="flex items-center gap-2 text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors text-left w-full"
                          onClick={() => {
                            setMenuOpen(false);
                            setProfileModalOpen(true);
                          }}
                        >
                          <PlusCircle className="w-4 h-4" />
                          Become an Event Pro
                        </button>
                      </motion.div>
                      
                      <motion.div 
                        className="h-px bg-border my-2"
                        variants={{
                          hidden: { opacity: 0, scaleX: 0 },
                          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.3 } }
                        }}
                      />
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/browse" 
                          className={navLinkClass('/browse')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <Search className="w-4 h-4 mr-2 inline" />
                          Browse & Book Event Pros
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/learn" 
                          className={navLinkClass('/learn')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 mr-2 inline" />
                          How It Works
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/faq" 
                          className={navLinkClass('/faq')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <HelpCircle className="w-4 h-4 mr-2 inline" />
                          FAQ
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/blog" 
                          className={navLinkClass('/blog')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 mr-2 inline" />
                          Blog
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}>
                        <Link 
                          to="/contact"
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors w-full"
                          onClick={() => setMenuOpen(false)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contact Us
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.nav>
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
