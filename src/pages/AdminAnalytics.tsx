/**
 * Admin Analytics Dashboard
 * Shows KPIs, demand/supply gaps, and conversion funnels
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, Users, Package, TrendingUp, TrendingDown, 
  AlertTriangle, Send, BarChart3, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalyticsAdmin } from '@/hooks/useAnalyticsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState as useStateReact } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useStateReact(false);
  const [checkingRole, setCheckingRole] = useStateReact(true);
  const [daysBack, setDaysBack] = useState(7);
  
  const { 
    loading, 
    error, 
    kpis, 
    topDemandSegments, 
    supplyGaps, 
    dailyMetrics 
  } = useAnalyticsAdmin(daysBack);

  // Check admin role
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const { data } = await supabase.rpc('get_my_roles');
      setIsAdmin(data?.includes('admin') || false);
      setCheckingRole(false);
    }
    checkAdmin();
  }, [user]);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  Marketplace performance and supply/demand insights
                </p>
              </div>
            </div>
            <Select value={String(daysBack)} onValueChange={(v) => setDaysBack(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <KPICard
            title="Searches"
            value={kpis.totalSearches}
            icon={<Search className="w-4 h-4" />}
            loading={loading}
          />
          <KPICard
            title="No-Match Rate"
            value={`${kpis.noMatchRate.toFixed(1)}%`}
            icon={<AlertTriangle className="w-4 h-4" />}
            loading={loading}
            trend={kpis.noMatchRate > 50 ? 'bad' : 'good'}
          />
          <KPICard
            title="Leads Submitted"
            value={kpis.leadsSubmitted}
            icon={<Send className="w-4 h-4" />}
            loading={loading}
          />
          <KPICard
            title="Lead Conversion"
            value={`${kpis.leadConversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-4 h-4" />}
            loading={loading}
            description="Leads / No-matches"
          />
          <KPICard
            title="Package Views"
            value={kpis.packageViews}
            icon={<Package className="w-4 h-4" />}
            loading={loading}
          />
          <KPICard
            title="Booking Starts"
            value={kpis.bookingStarts}
            icon={<Users className="w-4 h-4" />}
            loading={loading}
          />
          <KPICard
            title="Bookings Complete"
            value={kpis.bookingsCompleted}
            icon={<TrendingUp className="w-4 h-4" />}
            loading={loading}
          />
          <KPICard
            title="Booking Conversion"
            value={`${kpis.bookingConversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-4 h-4" />}
            loading={loading}
            description="Completed / Started"
          />
          <KPICard
            title="Signups"
            value={kpis.signups}
            icon={<Users className="w-4 h-4" />}
            loading={loading}
          />
        </div>

        {/* Daily Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Trends</CardTitle>
            <CardDescription>Searches, leads, and bookings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="searches" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="leads" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Demand Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Demand Segments
              </CardTitle>
              <CardDescription>Most searched categories & locations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Searches</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDemandSegments.slice(0, 10).map((seg, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge variant="secondary">{seg.category || 'Any'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {seg.city || 'Any'}{seg.state ? `, ${seg.state}` : ''}
                        </TableCell>
                        <TableCell className="text-right font-medium">{seg.count}</TableCell>
                      </TableRow>
                    ))}
                    {topDemandSegments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No search data yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Supply Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Supply Gaps
              </CardTitle>
              <CardDescription>High demand, low/no inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">No-Match</TableHead>
                      <TableHead className="text-right">Gap %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplyGaps.slice(0, 10).map((gap, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge variant="outline" className="border-destructive text-destructive">
                            {gap.category || 'Any'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {gap.city || 'Any'}{gap.state ? `, ${gap.state}` : ''}
                        </TableCell>
                        <TableCell className="text-right font-medium">{gap.noMatchCount}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={gap.gapRatio > 0.5 ? 'destructive' : 'secondary'}>
                            {(gap.gapRatio * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {supplyGaps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No supply gap data yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function KPICard({ 
  title, 
  value, 
  icon, 
  loading, 
  trend,
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  loading: boolean;
  trend?: 'good' | 'bad';
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">{title}</span>
          <span className={trend === 'bad' ? 'text-destructive' : trend === 'good' ? 'text-green-500' : 'text-muted-foreground'}>
            {icon}
          </span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
