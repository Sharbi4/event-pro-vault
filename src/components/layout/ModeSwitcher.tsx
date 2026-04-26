import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, Plus, User, LogOut } from 'lucide-react';
import { useUserDashboards } from '@/hooks/useUserDashboards';
import { useAuth } from '@/contexts/AuthContext';

interface ModeSwitcherProps {
  compact?: boolean;
}

export function ModeSwitcher({ compact = false }: ModeSwitcherProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasVendorPackages, loading } = useUserDashboards();
  const [open, setOpen] = useState(false);

  if (!user || loading) return null;

  const handleModeSwitch = (mode: 'Event Pro' | 'customer') => {
    setOpen(false);
    switch (mode) {
      case 'Event Pro':
        if (hasVendorPackages) {
          navigate('/vendor-dashboard');
        } else {
          navigate('/eventpro-onboarding');
        }
        break;
      case 'customer':
        navigate('/dashboard');
        break;
    }
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? 'sm' : 'default'} className="gap-2">
          <User className="w-4 h-4" />
          {!compact && 'My Account'}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Mode
        </DropdownMenuLabel>
        
        {/* Event Pro Mode */}
        <DropdownMenuItem 
          onClick={() => handleModeSwitch('Event Pro')}
          className="flex items-center gap-3 py-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Event Pro</span>
              {hasVendorPackages && (
                <Badge variant="secondary" className="text-[10px] px-1.5">Active</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasVendorPackages ? 'Manage your services' : 'List your services'}
            </p>
          </div>
          {!hasVendorPackages && <Plus className="w-4 h-4 text-muted-foreground" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Customer Dashboard */}
        <DropdownMenuItem 
          onClick={() => handleModeSwitch('customer')}
          className="flex items-center gap-3 py-2 cursor-pointer"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          <span>My Bookings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-3 py-2 cursor-pointer text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
