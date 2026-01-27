import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  User,
} from 'lucide-react';
import { Dispute } from '@/hooks/useDisputes';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface VendorDisputeCardProps {
  dispute: Dispute;
  onRespond: (disputeId: string, response: string, proposedRemedy?: string, accept?: boolean) => Promise<void>;
  processing?: boolean;
}

const reasonLabels: Record<string, string> = {
  no_show: 'Vendor did not show up',
  late: 'Vendor was significantly late',
  incomplete: 'Service was incomplete',
  quality: 'Quality issues',
  other: 'Other issue',
};

const remedyLabels: Record<string, string> = {
  full_refund: 'Full Refund',
  partial_refund: 'Partial Refund',
  credit: 'Account Credit',
  reschedule: 'Reschedule Service',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  vendor_response: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  mediation: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  resolved: 'bg-green-500/20 text-green-600 border-green-500/30',
  closed: 'bg-muted text-muted-foreground border-border',
  withdrawn: 'bg-muted text-muted-foreground border-border',
};

export function VendorDisputeCard({ dispute, onRespond, processing }: VendorDisputeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [proposedRemedy, setProposedRemedy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const deadline = dispute.vendor_response_deadline 
    ? new Date(dispute.vendor_response_deadline) 
    : null;
  const deadlinePassed = deadline ? isPast(deadline) : false;
  const needsResponse = dispute.status === 'pending' && !dispute.vendor_responded_at;

  const handleSubmitResponse = async (accept: boolean) => {
    if (!response.trim()) return;
    
    setSubmitting(true);
    await onRespond(dispute.id, response, proposedRemedy || undefined, accept);
    setSubmitting(false);
    setResponseDialogOpen(false);
    setResponse('');
    setProposedRemedy('');
  };

  return (
    <>
      <Card className={cn(
        'transition-all',
        needsResponse && !deadlinePassed && 'ring-2 ring-amber-500/50',
        processing && 'opacity-50 pointer-events-none'
      )}>
        <CardContent className="p-4">
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold">{reasonLabels[dispute.reason] || dispute.reason}</h3>
                  <Badge variant="outline" className={statusColors[dispute.status]}>
                    {dispute.status.replace('_', ' ')}
                  </Badge>
                  {dispute.requested_remedy && (
                    <Badge variant="secondary" className="text-xs">
                      Wants: {remedyLabels[dispute.requested_remedy]}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {dispute.booking && (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(dispute.booking.event_date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {dispute.booking.event_location}
                      </span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Filed {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Deadline warning */}
                {needsResponse && deadline && (
                  <div className={cn(
                    'mt-2 p-2 rounded text-sm flex items-center gap-2',
                    deadlinePassed 
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-600'
                  )}>
                    <Clock className="w-4 h-4" />
                    {deadlinePassed ? (
                      <span>Response deadline passed</span>
                    ) : (
                      <span>
                        Respond by {format(deadline, 'MMM d, h:mm a')} ({formatDistanceToNow(deadline, { addSuffix: true })})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {needsResponse && !deadlinePassed && (
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1"
                    onClick={() => setResponseDialogOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Respond
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      expanded && 'rotate-180'
                    )} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            {/* Expanded content */}
            <CollapsibleContent className="mt-4 pt-4 border-t space-y-4">
              {/* Customer's description */}
              <div>
                <Label className="text-sm text-muted-foreground">Customer's Description</Label>
                <p className="mt-1 text-sm">{dispute.description || 'No description provided'}</p>
              </div>

              {dispute.requested_remedy_details && (
                <div>
                  <Label className="text-sm text-muted-foreground">Remedy Details</Label>
                  <p className="mt-1 text-sm">{dispute.requested_remedy_details}</p>
                </div>
              )}

              {/* Evidence */}
              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Evidence ({dispute.evidence_urls.length} file{dispute.evidence_urls.length !== 1 ? 's' : ''})
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dispute.evidence_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-16 h-16 rounded border overflow-hidden hover:ring-2 ring-primary transition-all"
                      >
                        <img
                          src={url}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-muted flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>`;
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter info */}
              {dispute.reporter_profile && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Reported by:</span>
                  <span>{dispute.reporter_profile.display_name || dispute.reporter_profile.email}</span>
                </div>
              )}

              {/* Your response */}
              {dispute.vendor_response && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Label className="text-sm text-primary flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Your Response
                  </Label>
                  <p className="mt-1 text-sm">{dispute.vendor_response}</p>
                  {dispute.vendor_proposed_remedy && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Proposed remedy: {dispute.vendor_proposed_remedy}
                    </p>
                  )}
                </div>
              )}

              {/* Resolution */}
              {dispute.resolution_outcome && (
                <div className="p-3 rounded-lg bg-muted">
                  <Label className="text-sm text-muted-foreground">Resolution</Label>
                  <p className="mt-1 font-medium">{remedyLabels[dispute.resolution_outcome] || dispute.resolution_outcome}</p>
                  {dispute.resolution_notes && (
                    <p className="mt-1 text-sm text-muted-foreground">{dispute.resolution_notes}</p>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Dispute</DialogTitle>
            <DialogDescription>
              Provide your side of the story. You can accept the customer's requested remedy or propose an alternative.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Customer's request summary */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-600">Customer is requesting:</p>
              <p className="text-sm mt-1">
                {remedyLabels[dispute.requested_remedy || ''] || 'No specific remedy'}
              </p>
              {dispute.requested_remedy_details && (
                <p className="text-xs text-muted-foreground mt-1">{dispute.requested_remedy_details}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="response">Your Response *</Label>
              <Textarea
                id="response"
                placeholder="Explain your perspective on what happened..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedRemedy">Your Proposed Remedy (optional)</Label>
              <Textarea
                id="proposedRemedy"
                placeholder="If you disagree with the customer's request, propose an alternative..."
                value={proposedRemedy}
                onChange={(e) => setProposedRemedy(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => handleSubmitResponse(true)}
              disabled={submitting || !response.trim()}
              className="gap-1"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Accept Remedy
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSubmitResponse(false)}
              disabled={submitting || !response.trim()}
              className="gap-1"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Dispute & Mediate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
