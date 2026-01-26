import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  vendorUserId: string;
  vendorName: string;
  packageId?: string;
  packageName?: string;
  eventDate?: string;
  reviewerName: string;
  reviewerAvatar?: string;
}

export function ReviewDialog({
  open,
  onOpenChange,
  ...formProps
}: ReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Leave a Review</DialogTitle>
        </DialogHeader>
        <ReviewSubmissionForm
          {...formProps}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
