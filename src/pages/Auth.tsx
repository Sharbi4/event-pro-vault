import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, 
  Sparkles, Calendar, DollarSign, CheckCircle, TrendingUp,
  CreditCard, CalendarCheck
} from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';


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

const dashboardStats = [
  { label: 'This Month', value: '$4,280', trend: '+12%' },
  { label: 'Bookings', value: '23', trend: '+8%' },
  { label: 'Rating', value: '4.9', trend: '★' },
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
              className="relative"
            >
              <Card variant="glass" className="p-6 border-border/30 backdrop-blur-xl">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {dashboardStats.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="text-center"
                    >
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                        <span className="text-xs text-trust font-medium">{stat.trend}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mock Booking List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Wedding DJ Package</p>
                      <p className="text-xs text-muted-foreground">Saturday, Feb 15 • 6:00 PM</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">$600</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50 opacity-70">
                    <div className="w-10 h-10 rounded-lg bg-trust/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-trust" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Corporate Event</p>
                      <p className="text-xs text-muted-foreground">Friday, Feb 21 • 2:00 PM</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">$1,200</span>
                  </div>
                </div>
              </Card>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 -top-4"
              >
                <div className="bg-trust text-trust-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  Growing 12% this month
                </div>
              </motion.div>
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

          {/* Header */}
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
