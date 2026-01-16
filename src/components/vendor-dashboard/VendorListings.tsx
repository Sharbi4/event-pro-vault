import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Clock, 
  Calendar, 
  Zap,
  GripVertical 
} from 'lucide-react';
import { VendorPackage } from '@/hooks/useVendorDashboard';
import { PackageFormDialog } from './PackageFormDialog';

interface VendorListingsProps {
  packages: VendorPackage[];
  onCreate: (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<unknown>;
  onUpdate: (id: string, updates: Partial<VendorPackage>) => Promise<unknown>;
  onDelete: (id: string) => Promise<boolean>;
  onDuplicate: (id: string) => Promise<unknown>;
}

export function VendorListings({
  packages,
  onCreate,
  onUpdate,
  onDelete,
  onDuplicate
}: VendorListingsProps) {
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
            {packages.length}/20 packages
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
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
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
                      {!pkg.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pkg.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
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
                      <span className="text-muted-foreground">
                        • {pkg.includes?.length || 0} inclusions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Switch
                        checked={pkg.is_active}
                        onCheckedChange={() => handleToggleActive(pkg)}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingPackage(pkg)}
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
                        onClick={() => handleDelete(pkg.id)}
                        disabled={deletingId === pkg.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <PackageFormDialog
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
