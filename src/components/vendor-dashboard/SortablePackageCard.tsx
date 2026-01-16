import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Edit, 
  Copy, 
  Trash2, 
  Clock, 
  Calendar, 
  Zap,
  GripVertical,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { categories } from '@/data/categories';

interface SortablePackageCardProps {
  pkg: VendorPackage;
  onEdit: (pkg: VendorPackage) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (pkg: VendorPackage) => void;
  isDeleting: boolean;
}

export function SortablePackageCard({
  pkg,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  isDeleting
}: SortablePackageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pkg.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  };

  const category = categories.find(c => c.id === pkg.category);
  const coverImage = pkg.images?.[0];

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`${!pkg.is_active ? 'opacity-60' : ''} ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-6 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Cover Image or Placeholder */}
          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={pkg.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{pkg.name}</h3>
              <Badge variant="gradient">
                {pkg.type === 'HOURLY' ? (
                  <><Clock className="w-3 h-3 mr-1" /> Hourly</>
                ) : (
                  <><Calendar className="w-3 h-3 mr-1" /> Daily</>
                )}
              </Badge>
              {pkg.instant_book && (
                <Badge variant="trust">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              )}
              {category && (
                <Badge variant="secondary">{category.name}</Badge>
              )}
              {!pkg.is_active && (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-1">
              {pkg.description || 'No description'}
            </p>

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="font-bold gradient-text text-xl">
                ${pkg.price}
              </span>
              <span className="text-muted-foreground">
                /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
              </span>
              {pkg.min_units > 1 && (
                <span className="text-muted-foreground">
                  • {pkg.min_units} min
                </span>
              )}
              {pkg.travel_radius > 0 && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {pkg.travel_radius} mi
                </span>
              )}
              <span className="text-muted-foreground">
                • {pkg.includes?.length || 0} inclusions
              </span>
              {pkg.images?.length > 0 && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {pkg.images.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Active</span>
              <Switch
                checked={pkg.is_active}
                onCheckedChange={() => onToggleActive(pkg)}
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(pkg)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDuplicate(pkg.id)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(pkg.id)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
