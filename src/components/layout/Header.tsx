import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, MessageCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModeSwitcher } from './ModeSwitcher';
import { ProfileTypeModal } from './ProfileTypeModal';
import { setAuthIntent } from '@/lib/authIntent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/eventpro-logo.png';

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

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
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
    { to: '/learn', label: 'Learn More' },
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
                    {/* Logged in: Dashboard, FAQ, Contact */}
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
                    <button 
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.open('https://support.zendesk.com', '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Us
                    </button>
                  </>
                ) : (
                <>
                    {/* Guest: Sign In, Create Profile, Browse, Learn More, FAQ */}
                    <Link 
                      to="/auth" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      Sign In
                    </Link>
                    
                    <button 
                      className="text-sm font-medium text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setProfileModalOpen(true);
                      }}
                    >
                      Create a Free Profile
                    </button>
                    
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
                      to="/learn" 
                      className={`text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                        location.pathname === '/learn' 
                          ? 'text-foreground bg-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Learn More
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
