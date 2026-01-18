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
  Circle, 
  ArrowRight, 
  Building2, 
  CreditCard,
  Loader2
} from 'lucide-react';

type OnboardingStep = 'business-info' | 'connect' | 'connect-complete' | 'complete';

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
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('business-info');
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
          setCurrentStep('connect');
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
      setCurrentStep('connect');
    } catch (error) {
      console.error('Error saving business info:', error);
      toast.error('Failed to save business info');
    } finally {
      setLoading(false);
    }
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
    { id: 'business-info', label: 'Business Info', icon: Building2 },
    { id: 'connect', label: 'Payment Setup', icon: CreditCard },
    { id: 'complete', label: 'Complete', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['business-info', 'connect', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
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
