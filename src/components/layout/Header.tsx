import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Sparkles, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModeSwitcher } from './ModeSwitcher';
import { ProfileTypeModal } from './ProfileTypeModal';
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
    if (user) {
      navigate('/eventpro-onboarding');
    } else {
      navigate('/auth?returnTo=/eventpro-onboarding');
    }
    setMobileMenuOpen(false);
  };

  const handleListMarket = () => {
    if (user) {
      navigate('/marketspace/create');
    } else {
      navigate('/auth?returnTo=/marketspace/create');
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Browse' },
    { to: '/markets', label: 'Markets' },
    { to: '/how-it-works', label: 'How it Works' },
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
                alt="EventPro" 
                className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8 lg:h-9' : 'h-9 lg:h-10'}`}
              />
              <span className={`font-display font-bold text-foreground leading-tight transition-all duration-300 ${
                isScrolled ? 'text-base lg:text-lg' : 'text-lg lg:text-xl'
              }`}>
                EventPro
              </span>
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
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <ModeSwitcher />
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
              )}

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
            </div>

            {/* Mobile Right Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <Button 
                variant="darkShine" 
                size="sm"
                onClick={() => setProfileModalOpen(true)}
              >
                Create free profile
              </Button>
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
