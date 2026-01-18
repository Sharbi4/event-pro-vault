import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Edit2, 
  Trash2, 
  Clock, 
  Calendar,
  DollarSign,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface PackageData {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'HOURLY' | 'DAILY';
  price: number;
  min_units: number;
  images: string[];
  includes?: string[];
  instant_book?: boolean;
}

interface OnboardingPackageCardProps {
  pkg: PackageData;
  onEdit: (pkg: PackageData) => void;
  onDelete: (id: string) => void;
}

export function OnboardingPackageCard({ pkg, onEdit, onDelete }: OnboardingPackageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(pkg.id);
    setIsDeleting(false);
  };

  const getCategoryIcon = (category: string) => {
    // Return appropriate styling based on category
    const colors: Record<string, string> = {
      'food-truck': 'from-orange-500 to-red-500',
      'catering': 'from-amber-500 to-orange-500',
      'dj': 'from-purple-500 to-pink-500',
      'photography': 'from-blue-500 to-cyan-500',
      'event-planning': 'from-green-500 to-emerald-500',
      'entertainment': 'from-pink-500 to-rose-500',
      'other': 'from-gray-500 to-slate-500',
    };
    return colors[category] || 'from-primary to-accent';
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border">
      {/* Header with gradient background */}
      <div className={`relative h-32 bg-gradient-to-br ${getCategoryIcon(pkg.category)} overflow-hidden`}>
        {pkg.images && pkg.images.length > 0 ? (
          <img 
            src={pkg.images[0]} 
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Category badge */}
        <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground capitalize text-xs">
          {pkg.category?.replace('-', ' ') || 'Service'}
        </Badge>

        {/* Instant book badge */}
        {pkg.instant_book && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Instant Book
          </Badge>
        )}

        {/* Actions overlay */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onEdit(pkg)}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and description */}
        <div>
          <h3 className="font-semibold text-base line-clamp-1">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {pkg.description}
            </p>
          )}
        </div>

        {/* Includes preview */}
        {pkg.includes && pkg.includes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pkg.includes.slice(0, 2).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                {item}
              </span>
            ))}
            {pkg.includes.length > 2 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                +{pkg.includes.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Price and timing */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-primary">${pkg.price}</span>
            <span className="text-muted-foreground text-sm">
              /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">
            {pkg.type === 'HOURLY' ? (
              <Clock className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>Min {pkg.min_units} {pkg.type === 'HOURLY' ? 'hr' : 'day'}{pkg.min_units > 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
