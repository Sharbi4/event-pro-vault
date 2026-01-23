import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModeSwitcher } from './ModeSwitcher';
import { ProfileTypeModal } from './ProfileTypeModal';
import { setAuthIntent } from '@/lib/authIntent';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/eventpro-logo-new.png';

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
      setAuthIntent({
        intent: 'EVENT_PRO_ONBOARDING',
        profileType: 'EVENT_PRO',
      });
      navigate('/auth?intent=EVENT_PRO_ONBOARDING&profileType=EVENT_PRO');
    }
  };

  const navLinks = [
    { to: '/browse', label: 'Browse' },
    { to: '/learn', label: 'Learn' },
  ];

  return (
    <>
      {/* Floating Island Navigation */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto"
      >
        <nav className={`
          glass-float rounded-full px-4 py-2 lg:px-6 lg:py-3
          transition-all duration-300
          ${isScrolled ? 'shadow-medium' : 'shadow-soft'}
        `}>
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src={logo} 
                alt="Event Pro" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`
                    text-sm font-medium transition-colors
                    ${location.pathname === link.to 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="hidden lg:block w-px h-6 bg-border" />

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <ModeSwitcher />
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-sm">
                      Sign in
                    </Button>
                  </Link>
                  <Button 
                    size="sm"
                    className="btn-shimmer text-white rounded-full px-6"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-secondary/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] glass-float rounded-2xl p-4 shadow-elevated"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className={`
                      text-sm font-medium py-3 px-4 rounded-xl transition-colors
                      ${location.pathname === link.to 
                        ? 'text-foreground bg-secondary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-border my-2" />
                
                {user ? (
                  <div className="px-2">
                    <ModeSwitcher compact />
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/auth" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <button 
                      className="btn-shimmer text-white text-sm font-medium py-3 px-4 rounded-xl mt-1"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setProfileModalOpen(true);
                      }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <ProfileTypeModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </>
  );
}
