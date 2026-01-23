import { Link } from 'react-router-dom';
import logo from '@/assets/eventpro-logo-new.png';

export function Footer() {
  return (
    <footer className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Event Pro" 
              className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Essential Links */}
          <div className="flex items-center gap-8">
            <Link 
              to="/browse" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link 
              to="/become-a-pro" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Become a Pro
            </Link>
            <Link 
              to="/faq" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link 
              to="/support" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>

          {/* Made for Event Pros */}
          <p className="text-sm text-muted-foreground">
            Made for Event Pros
          </p>
        </div>
      </div>
    </footer>
  );
}
