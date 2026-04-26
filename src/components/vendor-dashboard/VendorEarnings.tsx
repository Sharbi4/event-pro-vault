import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, ArrowDownRight, ArrowUpRight, Download, CalendarIcon, X, BarChart3 } from 'lucide-react';
import { VendorBooking } from '@/hooks/useVendorDashboard';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, isWithinInterval, startOfDay, endOfDay, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Platform fee rate (12.9% commission on Vendor)
const VENDOR_COMMISSION_RATE = 0.129;

interface EarningsData {
  grossRevenue: number;
  platformFees: number;
  netPayout: number;
  pendingGross: number;
  pendingNet: number;
  depositsPaid: number;
  awaitingFinalPayment: number;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface VendorEarningsProps {
  bookings: VendorBooking[];
}

// Quick date range presets
const datePresets = [
  { label: 'This Month', getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Month', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Last 3 Months', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) }) },
  { label: 'This Year', getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: 'All Time', getRange: () => ({ from: undefined, to: undefined }) },
];

export function VendorEarnings({ bookings }: VendorEarningsProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [activePreset, setActivePreset] = useState<string>('All Time');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Filter bookings by date range
  const filterByDateRange = (booking: any): boolean => {
    if (!dateRange.from && !dateRange.to) return true;
    
    // Check deposit payment date or final payment date
    const depositDate = booking.deposit_paid_at ? new Date(booking.deposit_paid_at) : null;
    const finalDate = booking.final_paid_at ? new Date(booking.final_paid_at) : null;
    
    const from = dateRange.from ? startOfDay(dateRange.from) : new Date(0);
    const to = dateRange.to ? endOfDay(dateRange.to) : new Date();
    
    const interval = { start: from, end: to };
    
    return (depositDate && isWithinInterval(depositDate, interval)) || 
           (finalDate && isWithinInterval(finalDate, interval));
  };

  const filteredBookings = bookings.filter(filterByDateRange);

  const handlePresetClick = (preset: typeof datePresets[0]) => {
    const range = preset.getRange();
    setDateRange(range);
    setActivePreset(preset.label);
  };

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setActivePreset('');
    }
  };

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setActivePreset('All Time');
  };

  // Export to CSV function
  const exportToCSV = () => {
    const paidBookings = filteredBookings.filter((b: any) => b.deposit_paid_at || b.final_paid_at);
    
    if (paidBookings.length === 0) {
      toast({
        title: "No data to export",
        description: "Complete some bookings first to generate earnings data.",
        variant: "destructive"
      });
      return;
    }

    // CSV headers
    const headers = [
      'Date',
      'Event Location',
      'Event Date',
      'Payment Type',
      'Gross Amount ($)',
      'Platform Fee ($)',
      'Net Payout ($)',
      'Status'
    ];

    // Generate rows for each payment
    const rows: string[][] = [];
    
    paidBookings.forEach((booking: any) => {
      const eventDate = new Date(booking.event_date).toLocaleDateString('en-US');
      
      if (booking.deposit_paid_at) {
        const depositAmount = (booking.deposit_amount || 0) / 100;
        const baseDeposit = depositAmount / 1.129;
        const depositFee = baseDeposit * VENDOR_COMMISSION_RATE;
        const netDeposit = baseDeposit - depositFee;
        
        rows.push([
          new Date(booking.deposit_paid_at).toLocaleDateString('en-US'),
          `"${booking.event_location}"`,
          eventDate,
          'Deposit',
          baseDeposit.toFixed(2),
          depositFee.toFixed(2),
          netDeposit.toFixed(2),
          'Paid'
        ]);
      }
      
      if (booking.final_paid_at) {
        const finalAmount = (booking.final_amount || 0) / 100;
        const baseFinal = finalAmount / 1.129;
        const finalFee = baseFinal * VENDOR_COMMISSION_RATE;
        const netFinal = baseFinal - finalFee;
        
        rows.push([
          new Date(booking.final_paid_at).toLocaleDateString('en-US'),
          `"${booking.event_location}"`,
          eventDate,
          'Final Payment',
          baseFinal.toFixed(2),
          finalFee.toFixed(2),
          netFinal.toFixed(2),
          'Paid'
        ]);
      }
    });

    // Sort by date descending
    rows.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    // Calculate totals
    const totalGross = rows.reduce((sum, row) => sum + parseFloat(row[4]), 0);
    const totalFees = rows.reduce((sum, row) => sum + parseFloat(row[5]), 0);
    const totalNet = rows.reduce((sum, row) => sum + parseFloat(row[6]), 0);

    // Add totals row
    rows.push([]);
    rows.push(['', '', '', 'TOTALS', totalGross.toFixed(2), totalFees.toFixed(2), totalNet.toFixed(2), '']);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const dateRangeStr = dateRange.from && dateRange.to 
      ? `${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}`
      : 'all-time';
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings-report-${dateRangeStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Downloaded earnings report with ${rows.length - 2} transactions.`
    });
  };
  // Calculate earnings from bookings with payment data
  const calculateEarnings = (): EarningsData => {
    let grossRevenue = 0;
    let platformFees = 0;
    let pendingGross = 0;
    let depositsPaid = 0;
    let awaitingFinalPayment = 0;

    filteredBookings.forEach((booking: any) => {
      const totalPrice = Number(booking.total_price) || 0;
      const depositAmount = Number(booking.deposit_amount) || 0;
      const finalAmount = Number(booking.final_amount) || 0;
      
      // For completed/confirmed bookings with deposits paid
      if (booking.deposit_paid_at) {
        // Deposit amount is in cents, convert to dollars
        const depositDollars = depositAmount / 100;
        // Calculate base amount before booker service fee
        const baseDeposit = depositDollars / 1.129; // Remove the 12.9% booker fee
        const vendorCommission = baseDeposit * VENDOR_COMMISSION_RATE;
        
        depositsPaid += baseDeposit;
        grossRevenue += baseDeposit;
        platformFees += vendorCommission;
      }
      
      // For final payments made
      if (booking.final_paid_at) {
        const finalDollars = finalAmount / 100;
        const baseFinal = finalDollars / 1.129;
        const vendorCommission = baseFinal * VENDOR_COMMISSION_RATE;
        
        grossRevenue += baseFinal;
        platformFees += vendorCommission;
      } else if (booking.deposit_paid_at && !booking.final_paid_at && finalAmount > 0) {
        // Awaiting final payment
        const finalDollars = finalAmount / 100;
        const baseFinal = finalDollars / 1.129;
        awaitingFinalPayment += baseFinal;
      }
      
      // Pending bookings (not yet paid)
      if (booking.status === 'pending' || booking.status === 'awaiting_payment') {
        if (!booking.deposit_paid_at) {
          pendingGross += totalPrice;
        }
      }
    });

    const netPayout = grossRevenue - platformFees;
    const pendingNet = pendingGross * (1 - VENDOR_COMMISSION_RATE);

    return {
      grossRevenue,
      platformFees,
      netPayout,
      pendingGross,
      pendingNet,
      depositsPaid,
      awaitingFinalPayment
    };
  };

  const earnings = calculateEarnings();

  // Calculate month-over-month comparison
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthBookings = bookings.filter((b: any) => {
    const bookingDate = new Date(b.event_date);
    return bookingDate.getMonth() === currentMonth && 
           bookingDate.getFullYear() === currentYear &&
           b.deposit_paid_at;
  });
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthBookings = bookings.filter((b: any) => {
    const bookingDate = new Date(b.event_date);
    return bookingDate.getMonth() === lastMonth && 
           bookingDate.getFullYear() === lastMonthYear &&
           b.deposit_paid_at;
  });

  const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Generate chart data for last 12 months
  const chartData = useMemo(() => {
    const now = new Date();
    const monthsToShow = 12;
    const startDate = subMonths(startOfMonth(now), monthsToShow - 1);
    const endDate = endOfMonth(now);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      let grossRevenue = 0;
      let netPayout = 0;
      let transactionCount = 0;
      
      bookings.forEach((booking: any) => {
        // Check deposit payments
        if (booking.deposit_paid_at) {
          const depositDate = new Date(booking.deposit_paid_at);
          if (isSameMonth(depositDate, month)) {
            const depositAmount = (booking.deposit_amount || 0) / 100;
            const baseDeposit = depositAmount / 1.129;
            const fee = baseDeposit * VENDOR_COMMISSION_RATE;
            grossRevenue += baseDeposit;
            netPayout += baseDeposit - fee;
            transactionCount++;
          }
        }
        
        // Check final payments
        if (booking.final_paid_at) {
          const finalDate = new Date(booking.final_paid_at);
          if (isSameMonth(finalDate, month)) {
            const finalAmount = (booking.final_amount || 0) / 100;
            const baseFinal = finalAmount / 1.129;
            const fee = baseFinal * VENDOR_COMMISSION_RATE;
            grossRevenue += baseFinal;
            netPayout += baseFinal - fee;
            transactionCount++;
          }
        }
      });
      
      return {
        month: format(month, 'MMM yyyy'),
        shortMonth: format(month, 'MMM'),
        grossRevenue: Math.round(grossRevenue * 100) / 100,
        netPayout: Math.round(netPayout * 100) / 100,
        platformFees: Math.round((grossRevenue - netPayout) * 100) / 100,
        transactions: transactionCount
      };
    });
  }, [bookings]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-trust">
              Gross: ${payload[0]?.payload?.grossRevenue?.toFixed(2)}
            </p>
            <p className="text-primary">
              Net: ${payload[0]?.payload?.netPayout?.toFixed(2)}
            </p>
            <p className="text-destructive">
              Fees: -${payload[0]?.payload?.platformFees?.toFixed(2)}
            </p>
            <p className="text-muted-foreground">
              {payload[0]?.payload?.transactions} transaction(s)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={activePreset === preset.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Custom Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleCustomDateSelect}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {(dateRange.from || dateRange.to) && (
                <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {(dateRange.from || dateRange.to) && (
            <p className="text-sm text-muted-foreground mt-3">
              Showing earnings from {dateRange.from ? format(dateRange.from, "MMMM d, yyyy") : "the beginning"} to {dateRange.to ? format(dateRange.to, "MMMM d, yyyy") : "now"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-trust/10 to-trust/5 border-trust/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-trust" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${earnings.grossRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total before platform fees
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <ArrowDownRight className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">-${earnings.platformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              12.9% commission
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text">${earnings.netPayout.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your actual earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Earnings Trend (Last 12 Months)
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.some(d => d.grossRevenue > 0) ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--trust))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--trust))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="shortMonth" 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="grossRevenue"
                      stroke="hsl(var(--trust))"
                      strokeWidth={2}
                      fill="url(#colorGross)"
                      name="Gross Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="netPayout"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorNet)"
                      name="Net Payout"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="shortMonth" 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="grossRevenue" 
                      fill="hsl(var(--trust))" 
                      radius={[4, 4, 0, 0]}
                      name="Gross Revenue"
                    />
                    <Bar 
                      dataKey="netPayout" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Net Payout"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No earnings data yet</p>
                <p className="text-sm">Complete some bookings to see your earnings trend</p>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-trust" />
              <span className="text-sm text-muted-foreground">Gross Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Net Payout</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deposits Collected
            </CardTitle>
            <Receipt className="h-4 w-4 text-trust" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${earnings.depositsPaid.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Final Payment
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">${earnings.awaitingFinalPayment.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${earnings.pendingGross.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ~${earnings.pendingNet.toFixed(2)} net
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            {revenueChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-trust" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${thisMonthRevenue.toFixed(2)}</div>
            {lastMonthRevenue > 0 && (
              <p className={`text-xs ${revenueChange >= 0 ? 'text-trust' : 'text-destructive'}`}>
                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs last month
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {filteredBookings.filter((b: any) => b.deposit_paid_at || b.final_paid_at).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No completed transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {filteredBookings
                .filter((b: any) => b.deposit_paid_at || b.final_paid_at)
                .sort((a: any, b: any) => new Date(b.deposit_paid_at || b.created_at).getTime() - new Date(a.deposit_paid_at || a.created_at).getTime())
                .slice(0, 10)
                .map((booking: any) => {
                  const depositAmount = (booking.deposit_amount || 0) / 100;
                  const finalAmount = (booking.final_amount || 0) / 100;
                  const baseDeposit = depositAmount / 1.129;
                  const baseFinal = finalAmount / 1.129;
                  const depositFee = baseDeposit * VENDOR_COMMISSION_RATE;
                  const finalFee = baseFinal * VENDOR_COMMISSION_RATE;
                  
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div className="flex-1">
                        <p className="font-medium">{booking.event_location}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {booking.deposit_paid_at && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-trust/20 text-trust">
                              Deposit paid
                            </span>
                          )}
                          {booking.final_paid_at && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              Final paid
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          {booking.deposit_paid_at && (
                            <div>
                              <p className="text-sm font-medium">${baseDeposit.toFixed(2)}</p>
                              <p className="text-xs text-destructive">-${depositFee.toFixed(2)} fee</p>
                            </div>
                          )}
                          {booking.final_paid_at && (
                            <div>
                              <p className="text-sm font-medium">${baseFinal.toFixed(2)}</p>
                              <p className="text-xs text-destructive">-${finalFee.toFixed(2)} fee</p>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-bold text-trust mt-1">
                          Net: ${(
                            (booking.deposit_paid_at ? baseDeposit - depositFee : 0) +
                            (booking.final_paid_at ? baseFinal - finalFee : 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Breakdown Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">How Fees Work</h4>
              <p className="text-sm text-muted-foreground">
                We charge a 12.9% commission on your earnings. This helps us maintain the platform, 
                provide customer support, and process secure payments. Your net payout is automatically 
                transferred to your connected Stripe account after each successful booking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}