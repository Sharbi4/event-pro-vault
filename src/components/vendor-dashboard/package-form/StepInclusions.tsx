import { Check, Gift, AlertCircle, UtensilsCrossed, GlassWater } from 'lucide-react';
import { PackageFormData } from './PackageFormWizard';
import { FormSection } from './FormSection';
import { TagInput } from './TagInput';
import { AddOnInput } from './AddOnInput';
import { MenuItemsEditor, type MenuItem } from './MenuItemsEditor';

interface StepInclusionsProps {
  formData: PackageFormData;
  updateFormData: (updates: Partial<PackageFormData>) => void;
  /** Validation errors keyed by field id, surfaced inline by the wizard */
  errors?: Record<string, string>;
}

export function StepInclusions({ formData, updateFormData, errors }: StepInclusionsProps) {
  const isCatering = formData.package_kind === 'catering';
  const menuItems = (formData.menu_items ?? []) as MenuItem[];
  const menuError = errors?.menu_items;

  const setMenuItems = (items: MenuItem[]) => updateFormData({ menu_items: items });

  return (
    <div className="space-y-6">
      {isCatering && (
        <>
          {/* Menu items */}
          <FormSection
            icon={UtensilsCrossed}
            iconColor="text-orange-500"
            title="Menu items"
            description="Add the food items in this package. Mark each as included or as an upgrade with a price."
          >
            <MenuItemsEditor
              items={menuItems}
              onChange={setMenuItems}
              category="food"
              hasError={Boolean(menuError)}
            />
            {menuError && (
              <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {menuError}
              </p>
            )}
          </FormSection>

          {/* Drinks */}
          <FormSection
            icon={GlassWater}
            iconColor="text-sky-500"
            title="Included drinks"
            description="Beverages bundled with this package (water, iced tea, sodas, etc.)."
          >
            <MenuItemsEditor
              items={menuItems}
              onChange={setMenuItems}
              category="drink"
              placeholder="e.g. Bottled water"
            />
          </FormSection>
        </>
      )}

      {/* What's Included (general) */}
      <FormSection
        icon={Check}
        iconColor="text-green-500"
        title={isCatering ? "Other things included" : "What's included"}
        description={
          isCatering
            ? 'Plates, utensils, napkins, setup, service staff, etc.'
            : 'List everything customers get with this package'
        }
      >
        <TagInput
          items={formData.includes}
          onItemsChange={(includes) => updateFormData({ includes })}
          placeholder={
            isCatering
              ? 'e.g., Disposable plates, Setup & cleanup, 2 hours of service'
              : 'e.g., Professional sound system, 4 hours of service'
          }
          tagIcon={Check}
          tagColor="bg-green-500/10 text-green-700 dark:text-green-400"
        />
      </FormSection>

      {/* Add-ons */}
      <FormSection
        icon={Gift}
        iconColor="text-purple-500"
        title="Optional add-ons"
        description="Extra services customers can purchase on top of the package"
      >
        <AddOnInput
          addOns={formData.add_ons}
          onAddOnsChange={(add_ons) => updateFormData({ add_ons })}
        />
      </FormSection>

      {/* Requirements */}
      <FormSection
        icon={AlertCircle}
        iconColor="text-amber-500"
        title="Requirements"
        description="What customers need to provide (optional)"
      >
        <TagInput
          items={formData.requirements}
          onItemsChange={(requirements) => updateFormData({ requirements })}
          placeholder="e.g., Power outlet within 50ft, Covered area"
          tagIcon={AlertCircle}
          tagColor="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
      </FormSection>
    </div>
  );
}
