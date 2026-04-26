import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Crown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { PackageFormWizard } from './package-form/PackageFormWizard';
import { SortablePackageCard } from './SortablePackageCard';
import { toast } from '@/hooks/use-toast';
import { PackageWeeklyAvailability, PackageBlockedDate } from './package-form/StepAvailability';
import { savePackageAvailability } from '@/hooks/usePackageAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { useProSubscription } from '@/hooks/useProSubscription';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import { ShareKitDialog } from '@/components/share-kit/ShareKitDialog';

interface VendorListingsProps {
  packages: VendorPackage[];
  onCreate: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ id: string } | null>;
  onUpdate: (id: string, updates: Partial<VendorPackage>) => Promise<unknown>;
  onDelete: (id: string) => Promise<boolean>;
  onDuplicate: (id: string) => Promise<unknown>;
  onReorder?: (packages: VendorPackage[]) => Promise<void>;
}

export function VendorListings({
  packages,
  onCreate,
  onUpdate,
  onDelete,
  onDuplicate,
  onReorder
}: VendorListingsProps) {
  const { user } = useAuth();
  const { packageLimit, tier, startCheckout, checkoutLoading } = useProSubscription();
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [justPublished, setJustPublished] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<VendorPackage | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const previousOrderRef = useRef<VendorPackage[] | null>(null);

  const canCreatePackage = packages.length < packageLimit;

  const handleAddPackage = () => {
    if (canCreatePackage) {
      setIsCreating(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleSaveWithAvailability = async (
    data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    availability?: { weekly: PackageWeeklyAvailability[]; blocked: PackageBlockedDate[] }
  ) => {
    if (!user) return;

    let packageId: string | null = null;
    const wasAlreadyPublished = (editingPackage as any)?.status === 'published';
    const isPublishingNow = (data as any).status === 'published';

    if (editingPackage) {
      await onUpdate(editingPackage.id, data);
      packageId = editingPackage.id;
    } else {
      const result = await onCreate(data);
      packageId = result?.id || null;
    }

    // Save availability if we have a package ID and availability data
    if (packageId && availability) {
      const { success, error } = await savePackageAvailability(
        packageId,
        user.id,
        availability.weekly,
        availability.blocked
      );

      if (!success) {
        toast({
          title: "Warning",
          description: "Package saved but availability could not be saved: " + error,
          variant: "destructive"
        });
      }
    }

    setIsCreating(false);
    setEditingPackage(null);

    // Trigger Share Kit overlay only on transition to "published"
    if (packageId && isPublishingNow && !wasAlreadyPublished) {
      setJustPublished({ id: packageId, name: (data as any).name || 'your new package' });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleReorder = (reorderedPackages: VendorPackage[]) => {
    previousOrderRef.current = [...packages];
    onReorder?.(reorderedPackages);
    
    toast({
      title: "Packages reordered",
      description: "The order has been updated.",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (previousOrderRef.current) {
              onReorder?.(previousOrderRef.current);
              previousOrderRef.current = null;
            }
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = packages.findIndex(p => p.id === active.id);
      const newIndex = packages.findIndex(p => p.id === over.id);
      const reorderedPackages = arrayMove(packages, oldIndex, newIndex);
      handleReorder(reorderedPackages);
    }
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    setDeletingId(packageToDelete.id);
    await onDelete(packageToDelete.id);
    setDeletingId(null);
    setPackageToDelete(null);
  };

  const handleToggleActive = async (pkg: VendorPackage) => {
    await onUpdate(pkg.id, { is_active: !pkg.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Packages</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {packages.length}/{packageLimit} packages
            {tier === 'premium' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
            <span className="text-muted-foreground/60">• Drag or use arrow keys to reorder</span>
          </p>
        </div>
        <Button 
          variant="gradient" 
          onClick={handleAddPackage}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't created any packages yet
            </p>
            <Button variant="gradient" onClick={handleAddPackage}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={packages.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4" role="list" aria-label="Packages list. Use arrow keys on drag handles to reorder.">
              {packages.map((pkg, index) => (
                <SortablePackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onEdit={setEditingPackage}
                  onDuplicate={onDuplicate}
                  onDelete={setPackageToDelete}
                  onToggleActive={handleToggleActive}
                  isDeleting={deletingId === pkg.id}
                  isFirst={index === 0}
                  isLast={index === packages.length - 1}
                  onMoveUp={() => {
                    if (index > 0) {
                      const reordered = [...packages];
                      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
                      handleReorder(reordered);
                    }
                  }}
                  onMoveDown={() => {
                    if (index < packages.length - 1) {
                      const reordered = [...packages];
                      [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
                      handleReorder(reordered);
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Wizard */}
      <PackageFormWizard
        open={isCreating || !!editingPackage}
        onClose={() => {
          setIsCreating(false);
          setEditingPackage(null);
        }}
        onSubmit={handleSaveWithAvailability}
        initialData={editingPackage}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{packageToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          startCheckout();
          setShowUpgradeModal(false);
        }}
        loading={checkoutLoading}
        currentPackageCount={packages.length}
      />
    </div>
  );
}
