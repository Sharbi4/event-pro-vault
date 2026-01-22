import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}

export function FormSection({ 
  icon: Icon, 
  iconColor = 'text-primary',
  title, 
  description, 
  children,
  compact = false
}: FormSectionProps) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
