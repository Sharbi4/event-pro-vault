import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, MessageCircle, LayoutDashboard, LogOut, Mail, PlusCircle, Search, BookOpen, HelpCircle, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModeSwitcher } from './ModeSwitcher';
import { ProfileTypeModal } from './ProfileTypeModal';
import { setAuthIntent } from '@/lib/authIntent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/eventpro-logo.png';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userInitial, setUserInitial] = useState<string>('U');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isEventPro, setIsEventPro] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Fetch unread message count for logged-in users
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadMessageCount(0);
        return;
      }
      
      // Check if user is a vendor or customer and get unread counts accordingly
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
    
    // Subscribe to conversation updates
    if (user) {
      const channel = supabase
        .channel('header-unread-count')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
          fetchUnreadCount();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
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

  const handleListService = () => {
    setMobileMenuOpen(false);
    
    if (user) {
      navigate('/eventpro-onboarding');
    } else {
      // Use dedicated Event Pro auth page
      navigate('/auth/pro');
    }
  };


  const navLinks = [
    { to: '/', label: 'Browse' },
    { to: '/book-or-get-booked', label: 'Book or Get Booked' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-card border-b border-border/50 py-2' 
            : 'bg-background/80 backdrop-blur-sm border-b border-border/30 py-3'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-12 lg:h-14' : 'h-14 lg:h-16'
          }`}>
            {/* Logo - PNG only, ~72px standard */}
            <Link to="/" className="shrink-0">
              <img 
                src={logo} 
                alt="Event Pro by Vendibook" 
                className={`w-auto transition-all duration-300 ${isScrolled ? 'h-28 lg:h-32' : 'h-32 lg:h-36'}`}
              />
            </Link>

            {/* Right Actions - Both Desktop & Mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                    <DropdownMenuItem onClick={() => navigate('/booking-status')}>
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Booking Status
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
              <button
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Hamburger Menu - Both Desktop & Mobile */}
          {mobileMenuOpen && (
            <div className="py-4 border-t border-border/50 animate-fade-in bg-background">
              <nav className="flex flex-col gap-1">
                {user ? (
                  <>
                    {/* User greeting header */}
                    <div className="px-2 pb-3 flex items-center gap-3">
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
                    </div>
                    
                    <div className="px-2 pb-3">
                      <ModeSwitcher compact />
                    </div>
                    
                    <div className="h-px bg-border my-2" />
                    
                    <Link 
                      to="/browse" 
                      className={`text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/browse' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse
                    </Link>
                    
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/dashboard' && !location.search.includes('messages')
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    
                    <Link 
                      to="/booking-status" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/booking-status'
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ClipboardList className="w-4 h-4" />
                      Booking Status
                    </Link>
                    
                    <Link
                      to="/dashboard?tab=messages" 
                      className={`flex items-center justify-between text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/dashboard' && location.search.includes('messages')
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
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
                    
                    {isEventPro && (
                      <Link 
                        to="/vendor-dashboard?tab=listings&action=create" 
                        className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create Package
                      </Link>
                    )}
                    
                    <div className="h-px bg-border my-2" />
                    
                    <Link 
                      to="/browse" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/browse' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Search className="w-4 h-4" />
                      Browse Services
                    </Link>
                    
                    <Link
                      to="/faq" 
                      className={`text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/faq' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQ
                    </Link>
                    <Link 
                      to="/blog" 
                      className={`text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/blog') 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                    <Link 
                      to="/contact"
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Us
                    </Link>
                  </>
              ) : (
                <>
                    {/* Welcome header for guests */}
                    <div className="px-2 pb-3">
                      <p className="text-lg font-semibold text-foreground">Welcome!</p>
                      <p className="text-sm text-muted-foreground">Find the perfect pros for your event</p>
                    </div>
                    
                    <div className="h-px bg-border my-2" />
                    
                    <Link 
                      to="/auth" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 rotate-180" />
                      Sign In
                    </Link>
                    
                    <button 
                      className="flex items-center gap-2 text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setProfileModalOpen(true);
                      }}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Become an Event Pro
                    </button>
                    
                    <div className="h-px bg-border my-2" />
                    
                    <Link 
                      to="/browse" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/browse' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Search className="w-4 h-4" />
                      Browse Services
                    </Link>
                    
                    <Link 
                      to="/book-or-get-booked" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/book-or-get-booked' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="w-4 h-4" />
                      Book or Get Booked
                    </Link>
                    <Link 
                      to="/faq" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/faq' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4" />
                      FAQ
                    </Link>
                    <Link 
                      to="/blog" 
                      className={`flex items-center gap-2 text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/blog') 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="w-4 h-4" />
                      Blog
                    </Link>
                    <Link 
                      to="/contact"
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Us
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <ProfileTypeModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </>
  );
}
