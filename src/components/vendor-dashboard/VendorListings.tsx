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
import { Plus } from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { PackageFormWizard } from './package-form/PackageFormWizard';
import { SortablePackageCard } from './SortablePackageCard';
import { toast } from '@/hooks/use-toast';

interface VendorListingsProps {
  packages: VendorPackage[];
  onCreate: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<unknown>;
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
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const previousOrderRef = useRef<VendorPackage[] | null>(null);

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (pkg: VendorPackage) => {
    await onUpdate(pkg.id, { is_active: !pkg.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Listings</h2>
          <p className="text-sm text-muted-foreground">
            {packages.length}/20 packages • Drag or use arrow keys to reorder
          </p>
        </div>
        <Button 
          variant="gradient" 
          onClick={() => setIsCreating(true)}
          disabled={packages.length >= 20}
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
            <Button variant="gradient" onClick={() => setIsCreating(true)}>
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
                  onDelete={handleDelete}
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
        onSubmit={async (data) => {
          if (editingPackage) {
            await onUpdate(editingPackage.id, data);
          } else {
            await onCreate(data);
          }
          setIsCreating(false);
          setEditingPackage(null);
        }}
        initialData={editingPackage}
      />
    </div>
  );
}
