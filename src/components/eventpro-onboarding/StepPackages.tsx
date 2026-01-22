import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Plus, 
  Sparkles,
  ArrowRight,
  Edit,
  Trash2,
  Image
} from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { PackageFormWizard, PackageFormData } from '@/components/vendor-dashboard/package-form/PackageFormWizard';
import { cn } from '@/lib/utils';

interface StepPackagesProps {
  packages: VendorPackage[];
  onCreatePackage: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdatePackage: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDeletePackage: (id: string) => Promise<void>;
  selectedCategories: string[];
}

export function StepPackages({
  packages,
  onCreatePackage,
  onUpdatePackage,
  onDeletePackage,
  selectedCategories,
}: StepPackagesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);

  const handleSave = async (formData: PackageFormData) => {
    const packageData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      price: formData.price,
      min_units: formData.minUnits,
      includes: formData.includes,
      add_ons: formData.addOns,
      requirements: formData.requirements,
      instant_book: formData.instantBook,
      is_active: true,
      sort_order: packages.length,
      category: formData.category,
      images: formData.images,
      travel_radius: formData.travelRadius,
      travel_fee_per_mile: formData.travelFeePerMile,
      cancellation_policy: formData.cancellationPolicy,
    };

    if (editingPackage) {
      await onUpdatePackage(packageData);
    } else {
      await onCreatePackage(packageData);
    }

    setShowForm(false);
    setEditingPackage(null);
  };

  const handleEdit = (pkg: VendorPackage) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await onDeletePackage(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Create your packages
        </h2>
        <p className="text-muted-foreground text-sm">
          Packages help customers understand your services and pricing
        </p>
      </div>

      {/* Skip Notice */}
      <Card variant="glass" className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Packages are optional during onboarding
            </p>
            <p className="text-muted-foreground mt-1">
              You can skip this step and create packages later from your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Package List */}
      {packages.length > 0 && (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <PackageListItem
              key={pkg.id}
              package={pkg}
              onEdit={() => handleEdit(pkg)}
              onDelete={() => handleDelete(pkg.id)}
            />
          ))}
        </div>
      )}

      {/* Add Package Button */}
      {packages.length < 15 && (
        <Button
          variant="outline"
          onClick={() => {
            setEditingPackage(null);
            setShowForm(true);
          }}
          className="w-full h-16 border-dashed gap-2"
        >
          <Plus className="w-5 h-5" />
          {packages.length === 0 ? 'Create your first package' : 'Add another package'}
        </Button>
      )}

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            No packages created yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Create packages to showcase your services
          </p>
        </div>
      )}

      {/* Package count */}
      <div className="text-center text-xs text-muted-foreground">
        {packages.length} of 15 packages created
      </div>

      {/* Package Form Modal */}
      {showForm && (
        <PackageFormWizard
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingPackage(null);
          }}
          onSave={handleSave}
          editingPackage={editingPackage ? {
            name: editingPackage.name,
            description: editingPackage.description || '',
            type: editingPackage.type,
            price: editingPackage.price,
            minUnits: editingPackage.min_units,
            includes: editingPackage.includes,
            addOns: editingPackage.add_ons,
            requirements: editingPackage.requirements,
            instantBook: editingPackage.instant_book,
            category: editingPackage.category || '',
            images: editingPackage.images,
            travelRadius: editingPackage.travel_radius,
            travelFeePerMile: editingPackage.travel_fee_per_mile,
            cancellationPolicy: editingPackage.cancellation_policy,
          } : undefined}
          categories={selectedCategories}
        />
      )}
    </div>
  );
}

function PackageListItem({
  package: pkg,
  onEdit,
  onDelete,
}: {
  package: VendorPackage;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Image */}
          <div className="w-24 h-24 shrink-0 bg-muted relative">
            {pkg.images?.[0] ? (
              <img
                src={pkg.images[0]}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <h4 className="font-medium text-sm truncate">{pkg.name}</h4>
              <p className="text-xs text-muted-foreground">
                {pkg.type === 'HOURLY' ? 'Hourly' : 'Daily'} • 
                {pkg.instant_book && ' Instant Book'}
              </p>
            </div>
            <p className="text-primary font-bold">
              ${pkg.price}
              <span className="text-xs font-normal text-muted-foreground">
                /{pkg.type === 'HOURLY' ? 'hr' : 'day'}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col border-l border-border">
            <button
              onClick={onEdit}
              className="flex-1 px-3 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-3 flex items-center justify-center hover:bg-destructive/10 transition-colors border-t border-border"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
