import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Sparkles, Store, CheckCircle, XCircle, AlertTriangle,
  Loader2, MapPin, Phone, Instagram, Calendar, Building2,
  ExternalLink, RefreshCw
} from 'lucide-react';
import { useAdminReview, PendingEventPro, PendingMarket } from '@/hooks/useAdminReview';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function AdminReviewTab() {
  const {
    isAdmin,
    loading,
    pendingEventPros,
    pendingMarkets,
    processingId,
    approveEventPro,
    rejectEventPro,
    requestChangesEventPro,
    approveMarket,
    rejectMarket,
    requestChangesMarket,
    refetch,
  } = useAdminReview();

  const [selectedEventPro, setSelectedEventPro] = useState<PendingEventPro | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<PendingMarket | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_changes' | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleEventProAction = async () => {
    if (!selectedEventPro || !actionType) return;

    if (actionType === 'approve') {
      await approveEventPro(selectedEventPro.id);
    } else if (actionType === 'reject') {
      await rejectEventPro(selectedEventPro.id, feedbackNotes);
    } else if (actionType === 'request_changes') {
      await requestChangesEventPro(selectedEventPro.id, feedbackNotes);
    }

    setSelectedEventPro(null);
    setActionType(null);
    setFeedbackNotes('');
  };

  const handleMarketAction = async () => {
    if (!selectedMarket || !actionType) return;

    if (actionType === 'approve') {
      await approveMarket(selectedMarket.id);
    } else if (actionType === 'reject') {
      await rejectMarket(selectedMarket.id, feedbackNotes);
    } else if (actionType === 'request_changes') {
      await requestChangesMarket(selectedMarket.id, feedbackNotes);
    }

    setSelectedMarket(null);
    setActionType(null);
    setFeedbackNotes('');
  };

  const totalPending = pendingEventPros.length + pendingMarkets.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Admin Review
          </h2>
          <p className="text-muted-foreground">
            {totalPending} submission{totalPending !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="event-pros">
        <TabsList>
          <TabsTrigger value="event-pros" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Vendors
            {pendingEventPros.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingEventPros.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="markets" className="gap-2">
            <Store className="w-4 h-4" />
            Markets
            {pendingMarkets.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingMarkets.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Event Pros Tab */}
        <TabsContent value="event-pros" className="mt-6">
          {pendingEventPros.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-trust mb-4" />
                <p className="text-muted-foreground">No pending event pro submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingEventPros.map((pro) => (
                <Card key={pro.id} className={cn(
                  "transition-all",
                  processingId === pro.id && "opacity-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={pro.avatarUrl || undefined} />
                        <AvatarFallback>{pro.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{pro.displayName}</h3>
                          <Badge variant={pro.approvalStatus === 'needs_changes' ? 'outline' : 'secondary'}>
                            {pro.approvalStatus === 'needs_changes' ? 'Needs Changes' : 'Pending'}
                          </Badge>
                        </div>
                        
                        {pro.businessName && (
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {pro.businessName}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          {pro.formattedAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {pro.formattedAddress}
                            </span>
                          )}
                          {pro.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {pro.phone}
                            </span>
                          )}
                          {pro.instagramHandle && (
                            <span className="flex items-center gap-1">
                              <Instagram className="w-3 h-3" />
                              @{pro.instagramHandle}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Submitted {format(new Date(pro.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {pro.serviceCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pro.serviceCategories.map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {pro.shortBio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {pro.shortBio}
                          </p>
                        )}

                        {pro.approvalNotes && (
                          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-sm">
                            <strong>Previous feedback:</strong> {pro.approvalNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          disabled={processingId === pro.id}
                          onClick={() => {
                            setSelectedEventPro(pro);
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          disabled={processingId === pro.id}
                          onClick={() => {
                            setSelectedEventPro(pro);
                            setActionType('request_changes');
                            setFeedbackNotes('');
                          }}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Request Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          disabled={processingId === pro.id}
                          onClick={() => {
                            setSelectedEventPro(pro);
                            setActionType('reject');
                            setFeedbackNotes('');
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Markets Tab */}
        <TabsContent value="markets" className="mt-6">
          {pendingMarkets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-trust mb-4" />
                <p className="text-muted-foreground">No pending market submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingMarkets.map((market) => (
                <Card key={market.id} className={cn(
                  "transition-all",
                  processingId === market.id && "opacity-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {market.coverImageUrl ? (
                        <img 
                          src={market.coverImageUrl} 
                          alt={market.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center">
                          <Store className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{market.name}</h3>
                          <Badge variant={market.approvalStatus === 'needs_changes' ? 'outline' : 'secondary'}>
                            {market.approvalStatus === 'needs_changes' ? 'Needs Changes' : 'Pending'}
                          </Badge>
                          <Badge variant="outline">{market.marketType}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          {market.formattedAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {market.formattedAddress}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Submitted {format(new Date(market.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {market.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {market.description}
                          </p>
                        )}

                        {market.approvalNotes && (
                          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-sm">
                            <strong>Previous feedback:</strong> {market.approvalNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          disabled={processingId === market.id}
                          onClick={() => {
                            setSelectedMarket(market);
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          disabled={processingId === market.id}
                          onClick={() => {
                            setSelectedMarket(market);
                            setActionType('request_changes');
                            setFeedbackNotes('');
                          }}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Request Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          disabled={processingId === market.id}
                          onClick={() => {
                            setSelectedMarket(market);
                            setActionType('reject');
                            setFeedbackNotes('');
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Confirmation Dialog */}
      <AlertDialog 
        open={actionType === 'approve' && (!!selectedEventPro || !!selectedMarket)} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEventPro(null);
            setSelectedMarket(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Submission</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the {selectedEventPro ? 'event pro profile' : 'market'} visible to the public. 
              Are you sure you want to approve?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={selectedEventPro ? handleEventProAction : handleMarketAction}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback Dialog (for reject/request changes) */}
      <Dialog 
        open={(actionType === 'reject' || actionType === 'request_changes') && (!!selectedEventPro || !!selectedMarket)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEventPro(null);
            setSelectedMarket(null);
            setActionType(null);
            setFeedbackNotes('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'reject' ? 'Reject Submission' : 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'reject' 
                ? 'Provide a reason for rejecting this submission. The user will need to create a new listing.'
                : 'Describe what changes are needed. The user can edit and resubmit.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder={actionType === 'reject' 
                ? 'Reason for rejection...'
                : 'Please update the following...'
              }
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedEventPro(null);
              setSelectedMarket(null);
              setActionType(null);
              setFeedbackNotes('');
            }}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={selectedEventPro ? handleEventProAction : handleMarketAction}
              disabled={!feedbackNotes.trim()}
            >
              {actionType === 'reject' ? 'Reject' : 'Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
