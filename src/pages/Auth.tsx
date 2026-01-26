import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, 
  Sparkles, DollarSign, CheckCircle, CalendarCheck
} from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import AnimatedDashboardPreview from '@/components/auth/AnimatedDashboardPreview';
import MobileDashboardPreview from '@/components/auth/MobileDashboardPreview';
import { toast } from 'sonner';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const features = [
  {
    icon: Sparkles,
    title: 'Become an Event Pro',
    description: 'Create packages, set your availability, and start getting booked.',
  },
  {
    icon: CalendarCheck,
    title: 'Manage Bookings',
    description: 'Track all your bookings in one dashboard with instant notifications.',
  },
  {
    icon: DollarSign,
    title: 'Get Paid Securely',
    description: 'Receive payouts directly to your bank via Stripe integration.',
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle ?signup=true URL parameter
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    if (isSignUp) {
      const fullName = `${firstName} ${lastName}`.trim();
      const { error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/post-auth`,
      },
    });
    
    if (error) {
      toast.error('Failed to sign in with Google');
      setError(error.message);
    }
    setGoogleLoading(false);
  };
  useEffect(() => {
    const updateProfileWithName = async () => {
      if (user && isSignUp && (firstName || lastName)) {
        await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
          })
          .eq('user_id', user.id);
      }
    };
    
    updateProfileWithName();
  }, [user, isSignUp, firstName, lastName]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {isSignUp ? 'Start your journey' : 'Welcome back'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {isSignUp 
                  ? 'Join thousands of event professionals growing their business.'
                  : 'Track your bookings, manage your schedule, and grow your business.'
                }
              </p>
            </motion.div>

            {/* Animated Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AnimatedDashboardPreview />
            </motion.div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                const isActive = idx === activeFeature;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.5,
                      scale: isActive ? 1 : 0.98,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-primary/10' : 'bg-secondary/50'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {feature.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    {isActive && (
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 ml-auto" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeFeature 
                      ? 'bg-primary w-6' 
                      : 'bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground">
            © 2025 EventPro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background relative">
        {/* Mobile background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-1/3 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile Dashboard Preview */}
          <div className="lg:hidden">
            <MobileDashboardPreview />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp 
                ? 'Get started with EventPro'
                : 'Welcome back to EventPro'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="border-border/50">
              <CardContent className="p-5">
                {/* Google Sign-in Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-3 mb-4"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          First Name
                        </label>
                        <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-primary/50 transition-colors">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Last Name
                        </label>
                        <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-primary/50 transition-colors">
                          <input
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Email
                    </label>
                    <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-primary/50 transition-colors">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Password
                    </label>
                    <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-primary/50 transition-colors">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    variant="darkShine" 
                    className="w-full mt-4 gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-border/50 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mobile Feature Hints */}
          <div className="lg:hidden mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground">Become an Event Pro</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-trust/10 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-trust" />
              </div>
              <span className="text-muted-foreground">Manage all your bookings</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-accent" />
              </div>
              <span className="text-muted-foreground">Get paid securely</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
