import { AlertCircle, CheckCircle2, Clock, XCircle, FileEdit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApprovalStatusBannerProps {
  status: string | null | undefined;
  notes: string | null | undefined;
  type: 'eventpro' | 'market';
  onEditProfile?: () => void;
}

export function ApprovalStatusBanner({ status, notes, type, onEditProfile }: ApprovalStatusBannerProps) {
  // Don't show anything for approved status unless there are notes
  if (status === 'approved' && !notes) return null;
  
  // Don't show if no status
  if (!status) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          title: 'Pending Review',
          description: type === 'eventpro' 
            ? 'Your event pro profile is being reviewed by our team. This usually takes 1-2 business days.'
            : 'Your market listing is being reviewed by our team. This usually takes 1-2 business days.',
          bgClass: 'bg-amber-500/10 border-amber-500/30',
          iconClass: 'text-amber-500',
          textClass: 'text-amber-600',
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          title: 'Profile Approved',
          description: type === 'eventpro'
            ? 'Your profile has been approved and is now visible to customers.'
            : 'Your market listing has been approved and is now visible to vendors.',
          bgClass: 'bg-green-500/10 border-green-500/30',
          iconClass: 'text-green-500',
          textClass: 'text-green-600',
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'Submission Rejected',
          description: type === 'eventpro'
            ? 'Unfortunately, your profile was not approved. Please review the feedback below and submit a new application.'
            : 'Unfortunately, your market listing was not approved. Please review the feedback below and submit a new application.',
          bgClass: 'bg-destructive/10 border-destructive/30',
          iconClass: 'text-destructive',
          textClass: 'text-destructive',
        };
      case 'needs_changes':
        return {
          icon: FileEdit,
          title: 'Changes Requested',
          description: type === 'eventpro'
            ? 'Our team has requested some changes to your profile before it can be approved.'
            : 'Our team has requested some changes to your market listing before it can be approved.',
          bgClass: 'bg-orange-500/10 border-orange-500/30',
          iconClass: 'text-orange-500',
          textClass: 'text-orange-600',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Card className={cn('p-4 border', config.bgClass)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconClass)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', config.textClass)}>{config.title}</p>
          <p className={cn('text-sm opacity-80', config.textClass)}>
            {config.description}
          </p>
          
          {/* Feedback notes */}
          {notes && (
            <div className={cn('mt-3 p-3 rounded-lg bg-background/50 border', config.bgClass)}>
              <p className="text-xs font-medium text-muted-foreground mb-1">Admin Feedback:</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          
          {/* Action button for needs_changes or rejected */}
          {(status === 'needs_changes' || status === 'rejected') && onEditProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditProfile}
              className="mt-3 gap-2"
            >
              <FileEdit className="w-4 h-4" />
              {status === 'needs_changes' ? 'Make Changes' : 'Start New Application'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
