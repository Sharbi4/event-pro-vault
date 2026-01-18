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
  MapPin
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

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image or placeholder */}
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        {pkg.images && pkg.images.length > 0 ? (
          <img 
            src={pkg.images[0]} 
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Category badge */}
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground">
          {pkg.category || 'Uncategorized'}
        </Badge>

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onEdit(pkg)}
            className="h-8 w-8 p-0"
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
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {pkg.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>${pkg.price}</span>
            <span className="text-muted-foreground font-normal text-sm">
              /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            {pkg.type === 'HOURLY' ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            <span>Min {pkg.min_units} {pkg.type === 'HOURLY' ? 'hr' : 'day'}(s)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
