import { Check, Circle, CreditCard, MessageCircle, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  icon: 'payment' | 'message' | 'review' | 'calendar';
}

interface BookingChecklistProps {
  items: ChecklistItem[];
  className?: string;
  compact?: boolean;
}

const iconMap = {
  payment: CreditCard,
  message: MessageCircle,
  review: Star,
  calendar: Calendar,
};

export function BookingChecklist({ items, className = '', compact = false }: BookingChecklistProps) {
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex -space-x-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <div
                key={item.id}
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center border-2 border-background',
                  item.completed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {item.completed ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <Icon className="w-2.5 h-2.5" />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground uppercase tracking-wider">Pre-event checklist</span>
          <span className="font-medium">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2 text-xs transition-opacity',
                item.completed ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                  item.completed
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-muted-foreground/30'
                )}
              >
                {item.completed ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <Icon className="w-2.5 h-2.5 text-muted-foreground" />
                )}
              </div>
              <span className={cn(item.completed && 'line-through')}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Generate checklist items based on booking status
 */
export function generateBookingChecklist(booking: {
  deposit_paid_at?: string | null;
  final_paid_at?: string | null;
  hasConversation?: boolean;
  hasReview?: boolean;
  payment_method?: string;
}): ChecklistItem[] {
  const isCash = booking.payment_method === 'cash';
  
  const items: ChecklistItem[] = [];

  // Payment steps depend on payment method
  if (isCash) {
    items.push({
      id: 'payment-cash',
      label: 'Arrange payment with vendor',
      completed: true, // Cash bookings are always "arranged"
      icon: 'payment',
    });
  } else {
    items.push({
      id: 'deposit',
      label: 'Pay deposit',
      completed: !!booking.deposit_paid_at,
      icon: 'payment',
    });
    
    if (booking.deposit_paid_at && !booking.final_paid_at) {
      items.push({
        id: 'final-payment',
        label: 'Pay remaining balance',
        completed: !!booking.final_paid_at,
        icon: 'payment',
      });
    }
  }

  items.push({
    id: 'message',
    label: 'Confirm details with vendor',
    completed: !!booking.hasConversation,
    icon: 'message',
  });

  items.push({
    id: 'calendar',
    label: 'Add to calendar',
    completed: false, // We can't track this, but it's a good reminder
    icon: 'calendar',
  });

  return items;
}
