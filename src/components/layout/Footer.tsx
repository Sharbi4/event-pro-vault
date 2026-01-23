import { Link } from 'react-router-dom';
import logo from '@/assets/eventpro-logo-new.png';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img 
              src={logo} 
              alt="Event Pro" 
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/browse" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <span className="text-border">•</span>
            <Link to="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
            <span className="text-border">•</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </nav>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground">
            Made for Event Pros
          </p>
        </div>
      </div>
    </footer>
  );
}
