import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Clock,
  Calendar,
  Zap,
  MapPin,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Share2
} from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { categories } from '@/data/categories';
import { KeyboardEvent } from 'react';
import { toast } from '@/hooks/use-toast';

interface SortablePackageCardProps {
  pkg: VendorPackage;
  onEdit: (pkg: VendorPackage) => void;
  onDuplicate: (id: string) => Promise<unknown>;
  onDelete: (pkg: VendorPackage) => void;
  onToggleActive: (pkg: VendorPackage) => void;
  isDeleting: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function SortablePackageCard({
  pkg,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  isDeleting,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
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

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' && !isFirst && onMoveUp) {
      e.preventDefault();
      onMoveUp();
    } else if (e.key === 'ArrowDown' && !isLast && onMoveDown) {
      e.preventDefault();
      onMoveDown();
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/package/${pkg.id}`;
    const shareData = {
      title: pkg.name,
      text: `Check out ${pkg.name} on Event Pro!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your clients.',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`${!pkg.is_active ? 'opacity-60' : ''} ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag Handle with Keyboard Support */}
          <div className="flex flex-col items-center gap-1 mt-4">
            <button
              {...attributes}
              {...listeners}
              onKeyDown={handleKeyDown}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-none"
              aria-label={`Reorder ${pkg.name}. Use arrow keys to move up or down.`}
              title="Drag to reorder, or use arrow keys"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </button>
            {/* Visible arrow buttons for accessibility */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Move ${pkg.name} up`}
                title="Move up"
              >
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Move ${pkg.name} down`}
                title="Move down"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border">
                <DropdownMenuItem onClick={() => onEdit(pkg)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(pkg.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(pkg)}
                  className="text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
