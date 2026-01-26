import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface NameData {
  firstName: string;
  lastName: string;
}

interface NameInputProps {
  value: NameData;
  onChange: (value: NameData) => void;
  disabled?: boolean;
  showLabels?: boolean;
  required?: boolean;
}

export function NameInput({ 
  value, 
  onChange, 
  disabled = false,
  showLabels = true,
  required = false 
}: NameInputProps) {
  const updateField = (field: keyof NameData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="text-sm font-medium">
            First Name {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
          value={value.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          placeholder="John"
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="text-sm font-medium">
            Last Name {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
          value={value.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
          placeholder="Doe"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Helper to format full name
export function formatFullName(name: NameData): string {
  return `${name.firstName} ${name.lastName}`.trim();
}

// Helper to validate name
export function isNameComplete(name: NameData): boolean {
  return !!(name.firstName.trim() && name.lastName.trim());
}
