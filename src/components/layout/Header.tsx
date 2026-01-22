import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Sparkles, Store } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/eventpro-logo.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      navigate('/marketspace-onboarding');
    } else {
      navigate('/auth?returnTo=/marketspace-onboarding');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="EventPro by Vendibook" 
              className="h-10 lg:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/markets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Markets
            </Link>
          </nav>

          {/* Desktop CTA - Right */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              size="default" 
              className="gap-2"
              onClick={handleListMarket}
            >
              <Store className="w-4 h-4" />
              List a market
            </Button>
            <Button 
              variant="gradient" 
              size="default" 
              className="gap-2"
              onClick={handleListService}
            >
              <Sparkles className="w-4 h-4" />
              List your service
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                to="/markets" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Markets
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleListMarket}
                >
                  <Store className="w-4 h-4" />
                  List a market
                </Button>
                <Button 
                  variant="gradient" 
                  className="w-full gap-2"
                  onClick={handleListService}
                >
                  <Sparkles className="w-4 h-4" />
                  List your service
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
