import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2, Clock, Info, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DisputeEvidenceUpload } from '@/components/disputes/DisputeEvidenceUpload';
import { cn } from '@/lib/utils';

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  eventDate: string;
  eventEndTime?: string;
  packageName?: string;
  vendorName?: string;
  onSuccess?: () => void;
}

const issueTypes = [
  { value: 'no_show', label: 'Event Pro did not show up', description: 'The Event Pro never arrived for the event' },
  { value: 'late', label: 'Event Pro was significantly late', description: 'Arrived more than 30 minutes late' },
  { value: 'incomplete', label: 'Service was incomplete', description: 'Not all agreed services were provided' },
  { value: 'quality', label: 'Quality issues', description: 'Service did not meet expectations' },
  { value: 'other', label: 'Other issue', description: 'Something else went wrong' },
];

const remedyOptions = [
  { value: 'full_refund', label: 'Full Refund', description: 'Request a complete refund' },
  { value: 'partial_refund', label: 'Partial Refund', description: 'Request a partial refund' },
  { value: 'credit', label: 'Account Credit', description: 'Credit for a future booking' },
  { value: 'reschedule', label: 'Reschedule', description: 'Reschedule the service' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

export function ReportIssueDialog({
  open,
  onOpenChange,
  bookingId,
  eventDate,
  eventEndTime,
  packageName,
  vendorName,
  onSuccess,
}: ReportIssueDialogProps) {
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [requestedRemedy, setRequestedRemedy] = useState<string>('');
  const [remedyDetails, setRemedyDetails] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const { toast } = useToast();

  // Calculate time remaining in the 24-hour window
  const { hoursRemaining, isExpired } = useMemo(() => {
    const eventDateTime = new Date(eventDate);
    if (eventEndTime) {
      const [hours, minutes] = eventEndTime.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);
    } else {
      eventDateTime.setHours(23, 59, 59, 999);
    }
    
    const windowEnd = new Date(eventDateTime.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const msRemaining = windowEnd.getTime() - now.getTime();
    const hours = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));
    
    return {
      hoursRemaining: hours,
      isExpired: msRemaining <= 0,
    };
  }, [eventDate, eventEndTime]);

  const handleSubmit = async () => {
    if (!issueType) {
      toast({
        title: 'Select an issue type',
        description: 'Please select what type of issue occurred.',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the issue in detail.',
        variant: 'destructive',
      });
      return;
    }

    if (!requestedRemedy) {
      toast({
        title: 'Select a remedy',
        description: 'Please select what resolution you are requesting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to report an issue');

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('vendor_user_id')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking?.vendor_user_id) {
        throw new Error('Could not find booking information');
      }

      const { error: disputeError } = await supabase
        .from('disputes')
        .insert({
          booking_id: bookingId,
          reported_by_user_id: user.id,
          vendor_user_id: booking.vendor_user_id,
          reason: issueType,
          description: description,
          status: 'pending',
          filed_by_type: 'customer',
          evidence_urls: evidenceUrls,
          requested_remedy: requestedRemedy,
          requested_remedy_details: remedyDetails || null,
        });

      if (disputeError) throw disputeError;

      await supabase.functions.invoke('send-booking-notification', {
        body: {
          booking_id: bookingId,
          notification_type: 'issue_reported',
          issue_type: issueType,
          issue_description: description,
        },
      });

      toast({
        title: 'Dispute Filed',
        description: 'The Event Pro has 48 hours to respond. Our team will review if needed.',
      });

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast({
        title: 'Report Failed',
        description: 'Please try again or contact support directly.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIssueType('');
    setDescription('');
    setRequestedRemedy('');
    setRemedyDetails('');
    setEvidenceUrls([]);
    setStep(1);
  };

  const canProceedToStep2 = issueType && description.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            {packageName && vendorName
              ? `Report a problem with ${packageName} by ${vendorName}`
              : 'Let us know what went wrong so we can help resolve it.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time remaining warning */}
          {!isExpired && hoursRemaining <= 12 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">
                  {hoursRemaining} hour{hoursRemaining !== 1 ? 's' : ''} left to report
                </p>
                <p className="text-muted-foreground text-xs">
                  Issues must be reported within 24 hours of the event ending.
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Reporting window closed</p>
                <p className="text-muted-foreground text-xs">
                  The 24-hour window has passed. Please contact support directly for assistance.
                </p>
              </div>
            </div>
          )}

          {!isExpired && (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-2 text-sm">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>1</span>
                <span className="text-muted-foreground">Issue Details</span>
                <div className="flex-1 h-px bg-border" />
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>2</span>
                <span className="text-muted-foreground">Resolution</span>
              </div>

              {step === 1 && (
                <>
                  {/* Issue type selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">What happened?</Label>
                    <RadioGroup value={issueType} onValueChange={setIssueType} className="space-y-2">
                      {issueTypes.map((type) => (
                        <div
                          key={type.value}
                          className={cn(
                            'flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            issueType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          )}
                          onClick={() => setIssueType(type.value)}
                        >
                          <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                          <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                            <span className="font-medium text-sm">{type.label}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Describe the issue in detail *</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide as much detail as possible about what happened..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="resize-none min-h-[100px]"
                      rows={4}
                    />
                  </div>

                  {/* Evidence upload */}
                  <div className="space-y-2">
                    <Label>Upload Evidence (optional)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Photos, screenshots, or documents that support your claim.
                    </p>
                    <DisputeEvidenceUpload
                      onFilesChange={setEvidenceUrls}
                      existingUrls={evidenceUrls}
                      maxFiles={5}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Remedy selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">What resolution are you requesting?</Label>
                    <RadioGroup value={requestedRemedy} onValueChange={setRequestedRemedy} className="space-y-2">
                      {remedyOptions.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            'flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            requestedRemedy === option.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          )}
                          onClick={() => setRequestedRemedy(option.value)}
                        >
                          <RadioGroupItem value={option.value} id={`remedy-${option.value}`} className="mt-0.5" />
                          <Label htmlFor={`remedy-${option.value}`} className="flex-1 cursor-pointer">
                            <span className="font-medium text-sm">{option.label}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Remedy details */}
                  {(requestedRemedy === 'partial_refund' || requestedRemedy === 'other') && (
                    <div className="space-y-2">
                      <Label htmlFor="remedyDetails">
                        {requestedRemedy === 'partial_refund' ? 'How much refund?' : 'What do you want?'}
                      </Label>
                      <Textarea
                        id="remedyDetails"
                        placeholder={requestedRemedy === 'partial_refund' 
                          ? "e.g., 50% refund because the service was only partially completed..."
                          : "Describe what resolution you're looking for..."
                        }
                        value={remedyDetails}
                        onChange={(e) => setRemedyDetails(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* What happens next info */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>What happens next:</strong></p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Payouts are held pending resolution</li>
                        <li>The Event Pro has 48 hours to respond</li>
                        <li>If no agreement, our team mediates within 7 days</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 2 && !isExpired && (
            <Button variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {isExpired ? 'Close' : 'Cancel'}
          </Button>
          {!isExpired && (
            step === 1 ? (
              <Button 
                onClick={() => setStep(2)} 
                disabled={!canProceedToStep2}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !requestedRemedy}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Dispute
                  </>
                )}
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper hook to determine if a booking is eligible for issue reporting
export function useIssueReportingEligibility(
  eventDate: string,
  eventEndTime?: string,
  paymentMethod?: string
): { canReport: boolean; hoursRemaining: number } {
  return useMemo(() => {
    if (paymentMethod === 'cash') {
      return { canReport: false, hoursRemaining: 0 };
    }

    const eventDateTime = new Date(eventDate);
    if (eventEndTime) {
      const [hours, minutes] = eventEndTime.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);
    } else {
      eventDateTime.setHours(23, 59, 59, 999);
    }

    const now = new Date();
    
    if (now < eventDateTime) {
      return { canReport: false, hoursRemaining: 0 };
    }

    const windowEnd = new Date(eventDateTime.getTime() + 24 * 60 * 60 * 1000);
    const msRemaining = windowEnd.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));

    return {
      canReport: msRemaining > 0,
      hoursRemaining,
    };
  }, [eventDate, eventEndTime, paymentMethod]);
}
