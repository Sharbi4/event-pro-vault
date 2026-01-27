import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, 
  Calendar, Shield, Clock, Heart, CheckCircle2
} from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { setAuthIntent, getAuthIntent } from '@/lib/authIntent';
import { toast } from 'sonner';
import logo from '@/assets/eventpro-logo.png';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const benefits = [
  {
    icon: Calendar,
    title: 'Track Your Bookings',
    description: 'View and manage all your event bookings in one place.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Your payment info is protected with bank-level security.',
  },
  {
    icon: Clock,
    title: 'Faster Checkout',
    description: 'Save your details for quicker future bookings.',
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Bookmark your favorite event pros for later.',
  },
];

export default function AuthBooking() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false); // Default to signin for booking flow
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get package/booking context from URL or intent
  const packageId = searchParams.get('packageId');
  const draftId = searchParams.get('draftId');

  // Handle URL parameters
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    }
    
    // Set booking intent if package ID is provided
    if (packageId) {
      setAuthIntent({
        intent: 'BOOK_PACKAGE',
        payload: { packageId, draftId: draftId || undefined },
      });
    }
  }, [searchParams, packageId, draftId]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/post-auth');
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

  // Update profile with name after signup
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
      {/* Left Side - Booking Benefits */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-trust/5 via-background to-secondary/20 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 -left-32 w-96 h-96 bg-trust/10 rounded-full blur-[120px]"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/30 rounded-full blur-[100px]"
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between px-12 pt-6 pb-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/">
              <img src={logo} alt="EventPro" className="h-40 lg:h-60 w-auto" />
            </Link>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-trust/10 text-trust text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Complete Your Booking
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Almost there!
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Sign in or create an account to complete your booking and manage all your events in one place.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                }
              }}
              className="grid grid-cols-2 gap-4"
            >
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      borderColor: 'hsl(var(--trust) / 0.4)',
                      transition: { duration: 0.2 }
                    }}
                    className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-trust/30 transition-colors cursor-pointer"
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-lg bg-trust/10 flex items-center justify-center mb-3"
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="w-5 h-5 text-trust" />
                    </motion.div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Guest Checkout Note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/50 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Prefer not to create an account?</span>
                    {' '}You can still complete your booking as a guest. Just provide your email at checkout.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            © 2025 EventPro. All rights reserved.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side - Auth Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center px-6 pt-4 pb-6 bg-background relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Mobile background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <motion.div 
            className="absolute top-1/3 -left-32 w-64 h-64 bg-trust/20 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/3 -right-32 w-64 h-64 bg-secondary/30 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile Logo & Badge */}
          <motion.div 
            className="lg:hidden mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/">
              <img src={logo} alt="EventPro" className="h-16 w-auto mx-auto mb-4" />
            </Link>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-trust/10 text-trust text-sm font-medium"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <Calendar className="w-4 h-4" />
              Complete Your Booking
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="text-center mb-6"
          >
            <motion.h1 
              className="font-display text-2xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {isSignUp ? 'Create account' : 'Sign in to continue'}
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isSignUp 
                ? 'Create an account to manage your bookings'
                : 'Sign in to complete your booking'
              }
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <Card variant="glass" className="border-trust/20 overflow-hidden relative">
              {/* Shimmer effect on card */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-trust/5 to-transparent -z-10"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
              />
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
                        <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-trust/50 transition-colors">
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
                        <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-trust/50 transition-colors">
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
                    <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-trust/50 transition-colors">
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
                    <div className="flex items-center gap-2.5 bg-secondary/50 rounded-lg px-3 py-2.5 border border-border/50 focus-within:border-trust/50 transition-colors">
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
                    className="w-full mt-4 gap-2 bg-trust hover:bg-trust/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Continue to Booking'}
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

          {/* Mobile Benefits */}
          <motion.div 
            className="lg:hidden mt-6 space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
            }}
          >
            {benefits.slice(0, 3).map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  key={benefit.title} 
                  className="flex items-center gap-3 text-sm"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-trust/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-trust" />
                  </div>
                  <span className="text-muted-foreground">{benefit.title}</span>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.p 
            className="text-center text-xs text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
