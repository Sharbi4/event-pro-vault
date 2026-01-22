import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type OnboardingStep = 
  | 'profile-basics'
  | 'categories'
  | 'service-area'
  | 'media'
  | 'packages'
  | 'availability'
  | 'payout'
  | 'review';

export type PaymentMethod = 'cash' | 'stripe' | 'both';

export interface ProfileBasicsData {
  firstName: string;
  lastName: string;
  displayName: string;
  shortBio: string;
  websiteUrl: string;
  instagramHandle: string;
}

export interface ServiceAreaData {
  formattedAddress: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  travelRadiusMiles: number;
  travelFeeEnabled: boolean;
  serviceAreaType: 'on-site' | 'come-to-me' | 'either';
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  isCover?: boolean;
}

export interface WeeklyAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

export interface BufferSettings {
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  respectSetupBreakdown: boolean;
  availableByRequestOnly: boolean;
}

export interface OnboardingState {
  profileBasics: ProfileBasicsData;
  categories: string[];
  serviceArea: ServiceAreaData;
  mediaItems: MediaItem[];
  weeklyAvailability: WeeklyAvailability[];
  bufferSettings: BufferSettings;
  timezone: string;
  paymentMethod: PaymentMethod;
  isPublished: boolean;
}

const defaultWeeklyAvailability: WeeklyAvailability[] = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isEnabled: false }, // Sunday
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isEnabled: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isEnabled: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isEnabled: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isEnabled: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isEnabled: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isEnabled: false }, // Saturday
];

const initialState: OnboardingState = {
  profileBasics: {
    firstName: '',
    lastName: '',
    displayName: '',
    shortBio: '',
    websiteUrl: '',
    instagramHandle: '',
  },
  categories: [],
  serviceArea: {
    formattedAddress: '',
    city: '',
    state: '',
    lat: null,
    lng: null,
    travelRadiusMiles: 25,
    travelFeeEnabled: false,
    serviceAreaType: 'either',
  },
  mediaItems: [],
  weeklyAvailability: defaultWeeklyAvailability,
  bufferSettings: {
    bufferBeforeMinutes: 30,
    bufferAfterMinutes: 30,
    respectSetupBreakdown: true,
    availableByRequestOnly: false,
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  paymentMethod: 'stripe',
  isPublished: false,
};

export function useEventProOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile-basics');
  const [state, setState] = useState<OnboardingState>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [stripeStatus, setStripeStatus] = useState<string>('not_started');
  const [connectLoading, setConnectLoading] = useState(false);

  const steps: OnboardingStep[] = [
    'profile-basics',
    'categories',
    'service-area',
    'media',
    'packages',
    'availability',
    'payout',
    'review',
  ];

  const stepIndex = steps.indexOf(currentStep);

  // Load existing data on mount
  useEffect(() => {
    if (user) {
      loadExistingData();
    }
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch vendor details
      const { data: vendorDetails } = await supabase
        .from('vendor_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch weekly availability
      const { data: weeklyAvail } = await supabase
        .from('vendor_weekly_availability')
        .select('*')
        .eq('user_id', user.id);

      // Fetch buffer settings
      const { data: bufferData } = await supabase
        .from('vendor_buffer_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const newState = { ...initialState };

      if (profile) {
        newState.profileBasics = {
          firstName: profile.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: profile.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          displayName: profile.display_name || '',
          shortBio: profile.short_bio || '',
          websiteUrl: vendorDetails?.website_url || '',
          instagramHandle: profile.instagram_handle || '',
        };
        newState.isPublished = profile.is_published || false;

        // Restore last step
        if (profile.onboarding_step) {
          const savedStep = profile.onboarding_step as OnboardingStep;
          if (steps.includes(savedStep)) {
            setCurrentStep(savedStep);
          }
        }
      }

      if (vendorDetails) {
        newState.categories = vendorDetails.service_categories || [];
        newState.serviceArea = {
          formattedAddress: vendorDetails.formatted_address || '',
          city: vendorDetails.city || '',
          state: vendorDetails.state || '',
          lat: vendorDetails.base_location_lat || null,
          lng: vendorDetails.base_location_lng || null,
          travelRadiusMiles: vendorDetails.travel_radius_miles || 25,
          travelFeeEnabled: vendorDetails.travel_fee_enabled || false,
          serviceAreaType: (vendorDetails.service_area_type as 'on-site' | 'come-to-me' | 'either') || 'either',
        };
        newState.mediaItems = (vendorDetails.media_items as unknown as MediaItem[]) || [];
        newState.timezone = vendorDetails.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      if (weeklyAvail && weeklyAvail.length > 0) {
        // Merge with defaults
        newState.weeklyAvailability = defaultWeeklyAvailability.map(defaultDay => {
          const savedDay = weeklyAvail.find(w => w.day_of_week === defaultDay.dayOfWeek);
          if (savedDay) {
            return {
              dayOfWeek: savedDay.day_of_week,
              startTime: savedDay.start_time?.slice(0, 5) || '09:00',
              endTime: savedDay.end_time?.slice(0, 5) || '17:00',
              isEnabled: savedDay.is_enabled,
            };
          }
          return defaultDay;
        });
      }

      if (bufferData) {
        newState.bufferSettings = {
          bufferBeforeMinutes: bufferData.buffer_before_minutes,
          bufferAfterMinutes: bufferData.buffer_after_minutes,
          respectSetupBreakdown: bufferData.respect_setup_breakdown,
          availableByRequestOnly: bufferData.available_by_request_only,
        };
      }

      setState(newState);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async (data: Partial<OnboardingState> = {}) => {
    if (!user) return;
    setSaving(true);

    const mergedState = { ...state, ...data };

    try {
      // Update profile
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: mergedState.profileBasics.firstName,
          last_name: mergedState.profileBasics.lastName,
          display_name: mergedState.profileBasics.displayName,
          short_bio: mergedState.profileBasics.shortBio,
          instagram_handle: mergedState.profileBasics.instagramHandle,
          onboarding_step: currentStep,
          is_vendor: true,
        }, { onConflict: 'user_id' });

      // Update vendor details - check if exists first
      const { data: existingDetails } = await supabase
        .from('vendor_details')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingDetails) {
        await supabase
          .from('vendor_details')
          .update({
            service_categories: mergedState.categories,
            formatted_address: mergedState.serviceArea.formattedAddress,
            city: mergedState.serviceArea.city,
            state: mergedState.serviceArea.state,
            base_location_lat: mergedState.serviceArea.lat,
            base_location_lng: mergedState.serviceArea.lng,
            travel_radius_miles: mergedState.serviceArea.travelRadiusMiles,
            travel_fee_enabled: mergedState.serviceArea.travelFeeEnabled,
            service_area_type: mergedState.serviceArea.serviceAreaType,
            media_items: JSON.parse(JSON.stringify(mergedState.mediaItems)),
            timezone: mergedState.timezone,
            website_url: mergedState.profileBasics.websiteUrl,
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('vendor_details')
          .insert([{
            user_id: user.id,
            service_categories: mergedState.categories,
            formatted_address: mergedState.serviceArea.formattedAddress,
            city: mergedState.serviceArea.city,
            state: mergedState.serviceArea.state,
            base_location_lat: mergedState.serviceArea.lat,
            base_location_lng: mergedState.serviceArea.lng,
            travel_radius_miles: mergedState.serviceArea.travelRadiusMiles,
            travel_fee_enabled: mergedState.serviceArea.travelFeeEnabled,
            service_area_type: mergedState.serviceArea.serviceAreaType,
            media_items: JSON.parse(JSON.stringify(mergedState.mediaItems)),
            timezone: mergedState.timezone,
            website_url: mergedState.profileBasics.websiteUrl,
          }]);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  }, [user, state, currentStep]);

  const saveAvailability = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Delete existing and insert new weekly availability
      await supabase
        .from('vendor_weekly_availability')
        .delete()
        .eq('user_id', user.id);

      const availabilityToInsert = state.weeklyAvailability.map(day => ({
        user_id: user.id,
        day_of_week: day.dayOfWeek,
        start_time: day.startTime + ':00',
        end_time: day.endTime + ':00',
        is_enabled: day.isEnabled,
      }));

      await supabase
        .from('vendor_weekly_availability')
        .insert(availabilityToInsert);

      // Upsert buffer settings
      await supabase
        .from('vendor_buffer_settings')
        .upsert({
          user_id: user.id,
          buffer_before_minutes: state.bufferSettings.bufferBeforeMinutes,
          buffer_after_minutes: state.bufferSettings.bufferAfterMinutes,
          respect_setup_breakdown: state.bufferSettings.respectSetupBreakdown,
          available_by_request_only: state.bufferSettings.availableByRequestOnly,
        }, { onConflict: 'user_id' });

      // Update timezone
      await supabase
        .from('vendor_details')
        .update({ timezone: state.timezone })
        .eq('user_id', user.id);

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const publishProfile = async () => {
    if (!user) return false;
    setSaving(true);

    try {
      await supabase
        .from('profiles')
        .update({
          is_published: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      setState(prev => ({ ...prev, isPublished: true }));
      toast.success('Profile published!');
      return true;
    } catch (error) {
      console.error('Error publishing profile:', error);
      toast.error('Failed to publish profile');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateState = <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = async () => {
    await saveProgress();
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1]);
    }
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const canPublish = (): { canPublish: boolean; missing: string[] } => {
    const missing: string[] = [];
    
    if (!state.profileBasics.displayName) missing.push('Display Name');
    if (!state.profileBasics.shortBio) missing.push('Short Bio');
    if (state.categories.length === 0) missing.push('At least 1 category');
    if (!state.serviceArea.formattedAddress) missing.push('Service Area');
    if (state.mediaItems.filter(m => m.type === 'image').length === 0) missing.push('At least 1 photo');
    // Stripe is required if they selected stripe or both
    if ((state.paymentMethod === 'stripe' || state.paymentMethod === 'both') && stripeStatus !== 'active') {
      missing.push('Stripe payment setup');
    }

    return { canPublish: missing.length === 0, missing };
  };

  const checkStripeStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-connect-status');
      if (error) throw error;
      setStripeStatus(data.status || 'not_started');
      return data.status;
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      return 'not_started';
    }
  };

  const connectStripe = async () => {
    setConnectLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error('Failed to start payment setup');
    } finally {
      setConnectLoading(false);
    }
  };

  const savePaymentMethod = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const acceptsCash = state.paymentMethod === 'cash' || state.paymentMethod === 'both';
      const acceptsStripe = state.paymentMethod === 'stripe' || state.paymentMethod === 'both';
      
      await supabase
        .from('vendor_details')
        .update({
          payment_methods: state.paymentMethod === 'both' ? ['cash', 'stripe'] : [state.paymentMethod],
          accepts_cash: acceptsCash,
          accepts_stripe: acceptsStripe,
        })
        .eq('user_id', user.id);
        
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  // Check for Stripe return URL params
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'connect-complete' || step === 'connect-refresh') {
      checkStripeStatus();
      setCurrentStep('payout');
    }
  }, [searchParams]);

  return {
    currentStep,
    state,
    loading,
    saving,
    lastSaved,
    steps,
    stepIndex,
    stripeStatus,
    connectLoading,
    updateState,
    saveProgress,
    saveAvailability,
    savePaymentMethod,
    publishProfile,
    nextStep,
    prevStep,
    goToStep,
    canPublish,
    loadExistingData,
    checkStripeStatus,
    connectStripe,
  };
}
