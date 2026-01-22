import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Sparkles, Store, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModeSwitcher } from './ModeSwitcher';
import { ProfileTypeModal } from './ProfileTypeModal';
import { setAuthIntent } from '@/lib/authIntent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/eventpro-logo.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleListService = () => {
    setMobileMenuOpen(false);
    
    if (user) {
      navigate('/eventpro-onboarding');
    } else {
      // Set intent and redirect to auth
      setAuthIntent({
        intent: 'EVENT_PRO_ONBOARDING',
        profileType: 'EVENT_PRO',
      });
      navigate('/auth?intent=EVENT_PRO_ONBOARDING&profileType=EVENT_PRO');
    }
  };

  const handleListMarket = () => {
    setMobileMenuOpen(false);
    
    if (user) {
      navigate('/marketspace/create');
    } else {
      // Set intent and redirect to auth
      setAuthIntent({
        intent: 'MARKET_ONBOARDING',
        profileType: 'MARKET_SPACE',
      });
      navigate('/auth?intent=MARKET_ONBOARDING&profileType=MARKET_SPACE');
    }
  };

  const navLinks = [
    { to: '/', label: 'Browse' },
    { to: '/markets', label: 'Markets' },
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
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src={logo} 
                alt="Event Pro by Vendibook" 
                className={`w-auto transition-all duration-300 ${isScrolled ? 'h-7 lg:h-8' : 'h-8 lg:h-9'}`}
              />
              <div className="flex flex-col leading-none">
                <span className={`font-display font-bold text-foreground transition-all duration-300 ${
                  isScrolled ? 'text-sm lg:text-base' : 'text-base lg:text-lg'
                }`}>
                  Event Pro
                </span>
                <span className={`text-muted-foreground transition-all duration-300 ${
                  isScrolled ? 'text-[9px] lg:text-[10px]' : 'text-[10px] lg:text-xs'
                }`}>
                  by Vendibook
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA - Right */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => window.open('https://support.zendesk.com', '_blank')}
                    className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                    aria-label="Chat support"
                  >
                    <MessageCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </button>
                  <ModeSwitcher />
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>

                  <Button 
                    variant="darkShine" 
                    size="default" 
                    onClick={() => setProfileModalOpen(true)}
                  >
                    Create free profile
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        List <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover">
                      <DropdownMenuItem onClick={handleListService} className="gap-2 cursor-pointer">
                        <Sparkles className="w-4 h-4" />
                        List your service
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleListMarket} className="gap-2 cursor-pointer">
                        <Store className="w-4 h-4" />
                        List a market
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile Right Actions */}
            <div className="flex lg:hidden items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => window.open('https://support.zendesk.com', '_blank')}
                    className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                    aria-label="Chat support"
                  >
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <Button 
                  variant="darkShine" 
                  size="sm"
                  onClick={() => setProfileModalOpen(true)}
                >
                  Create free profile
                </Button>
              )}
              <button
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in bg-background">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className={`text-sm font-medium py-3 px-2 rounded-lg transition-colors ${
                      location.pathname === link.to 
                        ? 'text-foreground bg-secondary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {!user && (
                  <>
                    <div className="h-px bg-border my-3" />
                    
                    <button 
                      className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={handleListService}
                    >
                      <Sparkles className="w-4 h-4" />
                      List your service
                    </button>
                    <button 
                      className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={handleListMarket}
                    >
                      <Store className="w-4 h-4" />
                      List a market
                    </button>
                  </>
                )}

                <div className="h-px bg-border my-3" />

                {user ? (
                  <div className="px-2">
                    <ModeSwitcher compact />
                  </div>
                ) : (
                  <Link 
                    to="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    Sign in
                  </Link>
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
