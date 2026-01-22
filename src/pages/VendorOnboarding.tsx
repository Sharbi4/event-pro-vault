import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  CreditCard,
  Loader2,
  Sparkles,
  Users,
  Store,
  Star,
  Package,
  Plus,
  AlertCircle
} from 'lucide-react';
import { PackageFormWizard, PackageFormData } from '@/components/vendor-dashboard/package-form/PackageFormWizard';
import { OnboardingPackageCard } from '@/components/onboarding/OnboardingPackageCard';
import { VendorPackage } from '@/hooks/useVendorDashboard';

const MAX_PACKAGES = 15;

type VendorType = 'event-pro' | 'market' | null;
type OnboardingStep = 'welcome' | 'business-info' | 'packages' | 'connect' | 'connect-complete' | 'complete';

interface VendorFormData {
  businessName: string;
  businessType: string;
  businessDescription: string;
  serviceArea: string;
  websiteUrl: string;
}

export default function VendorOnboarding() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [vendorType, setVendorType] = useState<VendorType>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState<VendorFormData>({
    businessName: '',
    businessType: '',
    businessDescription: '',
    serviceArea: '',
    websiteUrl: '',
  });

  const [connectStatus, setConnectStatus] = useState<string>('not_started');
  
  // Package creation state
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Check URL params for return from Stripe
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'connect-complete' || step === 'connect-refresh') {
      checkConnectStatus();
    }
  }, [searchParams]);

  // Check existing status on load
  useEffect(() => {
    if (user) {
      checkExistingStatus();
    }
  }, [user]);

  const checkExistingStatus = async () => {
    if (!user) return;
    setCheckingStatus(true);
    
    try {
      // Check profile status
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_status, is_vendor')
        .eq('user_id', user.id)
        .single();

      // Check vendor details
      const { data: vendorDetails } = await supabase
        .from('vendor_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorDetails) {
        setFormData({
          businessName: vendorDetails.business_name || '',
          businessType: vendorDetails.business_type || '',
          businessDescription: vendorDetails.business_description || '',
          serviceArea: vendorDetails.service_area || '',
          websiteUrl: vendorDetails.website_url || '',
        });
      }

      if (profile) {
        setConnectStatus(profile.stripe_account_status || 'not_started');

        // Determine current step based on status
        if (profile.stripe_account_status === 'active') {
          setCurrentStep('complete');
        } else if (vendorDetails) {
          // Load existing packages
          await loadPackages();
          setCurrentStep('packages');
        } else {
          setCurrentStep('welcome');
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };


  const checkConnectStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-connect-status');
      if (error) throw error;
      
      setConnectStatus(data.status);
      if (data.status === 'active') {
        setCurrentStep('complete');
        toast.success('Payment setup complete!');
      } else if (data.detailsSubmitted) {
        toast.info('Your account is being reviewed.');
      }
    } catch (error) {
      console.error('Error checking connect:', error);
      toast.error('Failed to check payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInfoSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Upsert vendor details
      const { error } = await supabase
        .from('vendor_details')
        .upsert({
          user_id: user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          business_description: formData.businessDescription,
          service_area: formData.serviceArea,
          website_url: formData.websiteUrl,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Business info saved!');
      setCurrentStep('packages');
    } catch (error) {
      console.error('Error saving business info:', error);
      toast.error('Failed to save business info');
    } finally {
      setLoading(false);
    }
  };

  // Package management functions
  const loadPackages = async () => {
    if (!user) return;
    setLoadingPackages(true);
    try {
      const { data, error } = await supabase
        .from('vendor_packages')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setPackages((data || []) as unknown as VendorPackage[]);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleCreatePackage = async (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      // Serialize JSON fields for Supabase
      const { add_ons, additional_fees, ...rest } = data;
      const insertData = {
        ...rest,
        user_id: user.id,
        add_ons: add_ons ? JSON.parse(JSON.stringify(add_ons)) : [],
        additional_fees: additional_fees ? JSON.parse(JSON.stringify(additional_fees)) : [],
        sort_order: packages.length,
      };

      const { error } = await supabase
        .from('vendor_packages')
        .insert(insertData as any);

      if (error) throw error;
      toast.success('Package created!');
      await loadPackages();
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Failed to create package');
    }
  };

  const handleUpdatePackage = async (data: Omit<VendorPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !editingPackage) return;
    
    try {
      // Serialize JSON fields for Supabase
      const { add_ons, additional_fees, ...rest } = data;
      const updateData: Record<string, any> = { ...rest };
      if (add_ons !== undefined) {
        updateData.add_ons = JSON.parse(JSON.stringify(add_ons));
      }
      if (additional_fees !== undefined) {
        updateData.additional_fees = JSON.parse(JSON.stringify(additional_fees));
      }

      const { error } = await supabase
        .from('vendor_packages')
        .update(updateData)
        .eq('id', editingPackage.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Package updated!');
      setEditingPackage(null);
      await loadPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('vendor_packages')
        .delete()
        .eq('id', packageId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Package deleted');
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handlePackagesContinue = () => {
    setCurrentStep('connect');
  };

  const startConnectOnboarding = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting Connect onboarding:', error);
      toast.error('Failed to start payment setup');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  if (checkingStatus) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const steps = [
    { id: 'welcome', label: 'Welcome', icon: Sparkles },
    { id: 'business-info', label: 'Business Info', icon: Building2 },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'connect', label: 'Payment Setup', icon: CreditCard },
    { id: 'complete', label: 'Complete', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['welcome', 'business-info', 'packages', 'connect', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const handleVendorTypeSelect = (type: VendorType) => {
    setVendorType(type);
  };

  const handleWelcomeContinue = () => {
    if (vendorType) {
      setCurrentStep('business-info');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Become a <span className="gradient-text">Vendor</span>
          </h1>
          <p className="text-muted-foreground">
            Complete these steps to start listing your services
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'complete'
                      ? 'bg-primary text-primary-foreground'
                      : status === 'current'
                      ? 'bg-primary text-primary-foreground animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 ${status === 'current' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {currentStep === 'welcome' && (
          <div className="space-y-8 animate-fade-in">
            {/* Premium Welcome Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Join the Event Pros Network</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                What best describes you?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Choose your path to start showcasing your services to thousands of event planners
              </p>
            </div>

            {/* Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Event Pro Card */}
              <button
                onClick={() => handleVendorTypeSelect('event-pro')}
                className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 ${
                  vendorType === 'event-pro'
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'ring-1 ring-border hover:ring-primary/50 hover:shadow-lg'
                }`}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Selection indicator */}
                {vendorType === 'event-pro' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className="relative space-y-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold">Event Pro</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      DJs, photographers, caterers, entertainers, and other service providers who bring events to life
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-primary" />
                      <span>Create unlimited service packages</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-primary" />
                      <span>Get booked by event planners</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-primary" />
                      <span>Manage your availability</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Market Card */}
              <button
                onClick={() => handleVendorTypeSelect('market')}
                className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 ${
                  vendorType === 'market'
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'ring-1 ring-border hover:ring-primary/50 hover:shadow-lg'
                }`}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Selection indicator */}
                {vendorType === 'market' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className="relative space-y-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <Store className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold">Market</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Venues, festivals, and event organizers looking to host and manage multiple vendors
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-accent" />
                      <span>List your venue or market</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-accent" />
                      <span>Attract vendors to your events</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-accent" />
                      <span>Manage vendor applications</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleWelcomeContinue}
                disabled={!vendorType}
                size="lg"
                variant="gradient"
                className="min-w-[200px] shimmer-effect"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                <span className="trust-accent font-medium">Powered by Vendibook</span> — Trusted by 10,000+ event professionals
              </p>
            </div>
          </div>
        )}

        {currentStep === 'business-info' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Business Information
              </CardTitle>
              <CardDescription>
                Tell us about your business and the services you offer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food-truck">Food Truck</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                      <SelectItem value="dj">DJ / Music</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="event-planning">Event Planning</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Description</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="Describe your services..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area</Label>
                  <Input
                    id="serviceArea"
                    placeholder="e.g., Los Angeles, CA"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website (optional)</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://..."
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={handleBusinessInfoSubmit}
                disabled={loading || !formData.businessName || !formData.businessType}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Packages Step */}
        {currentStep === 'packages' && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Create Your Service Packages
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Add up to {MAX_PACKAGES} packages to showcase your services. You can always add more later.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{packages.length}</span>
                    <span className="text-muted-foreground">/{MAX_PACKAGES}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package count indicator */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${(packages.length / MAX_PACKAGES) * 100}%` }}
                  />
                </div>

                {loadingPackages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : packages.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No packages yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Create your first service package to start attracting customers
                    </p>
                    <Button 
                      onClick={() => setShowPackageForm(true)}
                      variant="gradient"
                      size="lg"
                      className="shimmer-effect"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Package
                    </Button>
                  </div>
                ) : (
                  /* Package grid */
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {packages.map((pkg) => (
                        <OnboardingPackageCard
                          key={pkg.id}
                          pkg={pkg}
                          onEdit={(p) => {
                            setEditingPackage(p as VendorPackage);
                            setShowPackageForm(true);
                          }}
                          onDelete={handleDeletePackage}
                        />
                      ))}
                      
                      {/* Add more card */}
                      {packages.length < MAX_PACKAGES && (
                        <button
                          onClick={() => setShowPackageForm(true)}
                          className="aspect-[16/9] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="font-medium">Add Package</span>
                        </button>
                      )}
                    </div>

                    {packages.length >= MAX_PACKAGES && (
                      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-sm">You've reached the maximum of {MAX_PACKAGES} packages.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Continue section */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <Button
                    onClick={() => setCurrentStep('business-info')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePackagesContinue}
                    variant="gradient"
                    className="flex-1"
                  >
                    {packages.length === 0 ? 'Skip for Now' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {packages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    You can always create packages later from your dashboard
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Package Form Dialog */}
            <PackageFormWizard
              open={showPackageForm}
              onClose={() => {
                setShowPackageForm(false);
                setEditingPackage(null);
              }}
              onSubmit={editingPackage ? handleUpdatePackage : handleCreatePackage}
              initialData={editingPackage}
            />
          </div>
        )}

        {currentStep === 'connect' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Setup
              </CardTitle>
              <CardDescription>
                Set up your payment account to receive earnings from bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">You'll need to provide:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Personal information for tax purposes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Bank account details for payouts
                  </li>
                </ul>
              </div>

              {connectStatus === 'pending_verification' && (
                <div className="text-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">Your account is being reviewed...</p>
                </div>
              )}

              <Button
                onClick={startConnectOnboarding}
                disabled={loading}
                className="w-full"
                variant="gradient"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                {connectStatus === 'pending' ? 'Continue Setup' : 'Set Up Payments'}
              </Button>

              {connectStatus === 'pending_verification' && (
                <Button variant="outline" onClick={checkConnectStatus} className="w-full">
                  Check Status
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 'complete' && (
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted-foreground mb-6">
                Your vendor account is ready. Start creating your first service listing.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/dashboard/listings/new')} variant="gradient">
                  Create Listing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
