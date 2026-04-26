import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useDisputes } from '@/hooks/useDisputes';
import { VendorDisputeCard } from '@/components/disputes/VendorDisputeCard';

export function VendorDisputes() {
  const { disputes, loading, processingId, refetch, respondToDispute } = useDisputes('Event Pro');

  const pendingDisputes = disputes.filter(d => d.status === 'pending' && !d.vendor_responded_at);
  const inProgressDisputes = disputes.filter(d => 
    d.status === 'vendor_response' || 
    d.status === 'mediation' || 
    (d.status === 'pending' && d.vendor_responded_at)
  );
  const resolvedDisputes = disputes.filter(d => 
    d.status === 'resolved' || 
    d.status === 'closed' || 
    d.status === 'withdrawn'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Disputes
          </h2>
          <p className="text-muted-foreground">
            {pendingDisputes.length > 0 
              ? `${pendingDisputes.length} dispute${pendingDisputes.length !== 1 ? 's' : ''} need your response`
              : 'Manage customer disputes and issues'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Urgent Banner */}
      {pendingDisputes.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium text-amber-600">
                {pendingDisputes.length} dispute{pendingDisputes.length !== 1 ? 's' : ''} awaiting your response
              </p>
              <p className="text-sm text-muted-foreground">
                Respond within 48 hours to prevent automatic escalation to mediation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Needs Response
            {pendingDisputes.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingDisputes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            In Progress
            {inProgressDisputes.length > 0 && (
              <Badge variant="secondary" className="ml-1">{inProgressDisputes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingDisputes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-trust mb-4" />
                <p className="text-muted-foreground">No disputes awaiting your response</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingDisputes.map((dispute) => (
                <VendorDisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  onRespond={respondToDispute}
                  processing={processingId === dispute.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {inProgressDisputes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No disputes in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {inProgressDisputes.map((dispute) => (
                <VendorDisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  onRespond={respondToDispute}
                  processing={processingId === dispute.id}
                />
              ))}
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
              {resolvedDisputes.map((dispute) => (
                <VendorDisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  onRespond={respondToDispute}
                  processing={processingId === dispute.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
