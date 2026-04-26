import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  Gavel,
  User,
  DollarSign,
  FileText,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { useDisputes, Dispute } from '@/hooks/useDisputes';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const reasonLabels: Record<string, string> = {
  no_show: 'Event Pro did not show up',
  late: 'Event Pro was significantly late',
  incomplete: 'Service was incomplete',
  quality: 'Quality issues',
  other: 'Other issue',
};

const remedyLabels: Record<string, string> = {
  full_refund: 'Full Refund',
  partial_refund: 'Partial Refund',
  vendor_paid: 'Pay Event Pro',
  credit: 'Account Credit',
  reschedule: 'Reschedule Service',
  denied: 'Deny Claim',
  withdrawn: 'Withdrawn',
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

export function AdminDisputesTab() {
  const { disputes, loading, processingId, refetch, resolveDispute } = useDisputes('admin');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [depositRefund, setDepositRefund] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const mediationDisputes = disputes.filter(d => d.status === 'mediation' || d.status === 'vendor_response');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved' || d.status === 'closed' || d.status === 'withdrawn');

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const handleResolve = async () => {
    if (!selectedDispute || !selectedOutcome) return;
    
    await resolveDispute(
      selectedDispute.id,
      selectedOutcome as Dispute['resolution_outcome'],
      resolutionNotes,
      depositRefund
    );
    
    setResolveDialogOpen(false);
    setSelectedDispute(null);
    setSelectedOutcome('');
    setResolutionNotes('');
    setDepositRefund(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderDisputeCard = (dispute: Dispute) => {
    const isExpanded = expandedIds.has(dispute.id);
    const needsAction = dispute.status === 'mediation' || (dispute.status === 'pending' && dispute.vendor_responded_at);

    return (
      <Card key={dispute.id} className={cn(
        'transition-all',
        needsAction && 'ring-2 ring-purple-500/50',
        processingId === dispute.id && 'opacity-50'
      )}>
        <CardContent className="p-4">
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(dispute.id)}>
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
                      Requested: {remedyLabels[dispute.requested_remedy]}
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
                        <DollarSign className="w-3 h-3" />
                        ${((dispute.booking.total_price || 0) / 100).toFixed(0)}
                      </span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Parties */}
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  {dispute.reporter_profile && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="w-3 h-3" />
                      Customer: {dispute.reporter_profile.display_name || dispute.reporter_profile.email}
                    </span>
                  )}
                  {dispute.vendor_profile && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      Vendor: {dispute.vendor_profile.business_name || dispute.vendor_profile.display_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(dispute.status === 'mediation' || dispute.status === 'vendor_response') && (
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1"
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setResolveDialogOpen(true);
                    }}
                  >
                    <Gavel className="w-4 h-4" />
                    Resolve
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

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
                        className="block w-20 h-20 rounded border overflow-hidden hover:ring-2 ring-primary transition-all"
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

              {/* Event Pro's response */}
              {dispute.vendor_response && (
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <Label className="text-sm text-blue-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Event Pro's Response
                  </Label>
                  <p className="mt-1 text-sm">{dispute.vendor_response}</p>
                  {dispute.vendor_proposed_remedy && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Proposed remedy: {dispute.vendor_proposed_remedy}
                    </p>
                  )}
                  {dispute.vendor_responded_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responded {formatDistanceToNow(new Date(dispute.vendor_responded_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}

              {/* Resolution */}
              {dispute.resolution_outcome && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Label className="text-sm text-green-600">Resolution</Label>
                  <p className="mt-1 font-medium">{remedyLabels[dispute.resolution_outcome] || dispute.resolution_outcome}</p>
                  {dispute.resolution_notes && (
                    <p className="mt-1 text-sm text-muted-foreground">{dispute.resolution_notes}</p>
                  )}
                  {dispute.deposit_refund_ordered && (
                    <Badge variant="outline" className="mt-2 text-xs">Deposit refund ordered</Badge>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-purple-500" />
            Dispute Management
          </h2>
          <p className="text-muted-foreground">
            {mediationDisputes.length > 0 
              ? `${mediationDisputes.length} dispute${mediationDisputes.length !== 1 ? 's' : ''} need mediation`
              : 'Review and resolve customer disputes'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mediation">
        <TabsList>
          <TabsTrigger value="mediation" className="gap-2">
            <Gavel className="w-4 h-4" />
            Needs Mediation
            {mediationDisputes.length > 0 && (
              <Badge variant="destructive" className="ml-1">{mediationDisputes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Awaiting Response
            {pendingDisputes.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingDisputes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mediation" className="mt-6">
          {mediationDisputes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-trust mb-4" />
                <p className="text-muted-foreground">No disputes awaiting mediation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {mediationDisputes.map(renderDisputeCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingDisputes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No disputes awaiting Event Pro response</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingDisputes.map(renderDisputeCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          {resolvedDisputes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resolved disputes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resolvedDisputes.map(renderDisputeCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Resolution Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Make a final decision on this dispute. Your decision will be communicated to both parties.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dispute summary */}
            {selectedDispute && (
              <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                <p><strong>Issue:</strong> {reasonLabels[selectedDispute.reason]}</p>
                <p><strong>Customer wants:</strong> {remedyLabels[selectedDispute.requested_remedy || ''] || 'Not specified'}</p>
                {selectedDispute.vendor_proposed_remedy && (
                  <p><strong>Event Pro proposes:</strong> {selectedDispute.vendor_proposed_remedy}</p>
                )}
              </div>
            )}

            {/* Outcome selection */}
            <div className="space-y-3">
              <Label>Resolution Outcome *</Label>
              <RadioGroup value={selectedOutcome} onValueChange={setSelectedOutcome} className="space-y-2">
                {[
                  { value: 'full_refund', label: 'Full Refund', desc: 'Customer receives full refund' },
                  { value: 'partial_refund', label: 'Partial Refund', desc: 'Customer receives partial refund' },
                  { value: 'vendor_paid', label: 'Pay Vendor', desc: 'Release funds to Vendor' },
                  { value: 'credit', label: 'Account Credit', desc: 'Customer receives credit for future use' },
                  { value: 'denied', label: 'Deny Claim', desc: 'Dispute is not valid' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedOutcome === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedOutcome(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <span className="font-medium text-sm">{option.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Deposit refund checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="depositRefund"
                checked={depositRefund}
                onCheckedChange={(checked) => setDepositRefund(checked === true)}
              />
              <Label htmlFor="depositRefund" className="text-sm cursor-pointer">
                Order deposit refund (overrides default non-refundable policy)
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Resolution Notes</Label>
              <Textarea
                id="notes"
                placeholder="Explain your decision (visible to both parties)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!selectedOutcome || processingId === selectedDispute?.id}
            >
              {processingId === selectedDispute?.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Gavel className="w-4 h-4 mr-2" />
              )}
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
