import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, MessageCircle, Camera, Star, Shield, 
  CheckCircle, ArrowRight, ArrowLeft, Sparkles,
  ThumbsUp, Award, Heart
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface BestPractice {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tips: string[];
  proTip: string;
}

const bestPractices: BestPractice[] = [
  {
    id: 'punctuality',
    icon: Clock,
    title: 'Be Punctual & Prepared',
    subtitle: 'Arriving on time sets the tone for a successful event',
    tips: [
      'Arrive 15-30 minutes early for setup time',
      'Account for traffic and parking in your planning',
      'Have a backup plan for unexpected delays',
      'Confirm the venue address and entry instructions the day before',
      'Pack your equipment the night before to avoid last-minute rushing'
    ],
    proTip: 'Send a "heading out" text to your client when you leave - it builds trust and reduces their anxiety.'
  },
  {
    id: 'communication',
    icon: MessageCircle,
    title: 'Communicate Proactively',
    subtitle: 'Clear communication prevents problems and builds relationships',
    tips: [
      'Respond to inquiries within 24 hours (ideally same-day)',
      'Send a confirmation message 48 hours before the event',
      'Be clear about what is included and what costs extra',
      'Ask questions upfront to understand client expectations',
      'Provide updates if anything changes with your schedule'
    ],
    proTip: 'Create message templates for common responses - it saves time while maintaining a personal touch.'
  },
  {
    id: 'presentation',
    icon: Camera,
    title: 'Present Yourself Professionally',
    subtitle: 'First impressions matter for repeat bookings',
    tips: [
      'Dress appropriately for the event type',
      'Keep your equipment clean and well-maintained',
      'Bring business cards or a way to share your contact info',
      'Maintain a positive attitude even under pressure',
      'Be polite to all guests - they could be future clients'
    ],
    proTip: 'Take a few photos of your setup at each event - great for your portfolio and social media.'
  },
  {
    id: 'reviews',
    icon: Star,
    title: 'Earn 5-Star Reviews',
    subtitle: 'Great reviews are your best marketing tool',
    tips: [
      'Go above and beyond when you can - small gestures matter',
      'Follow up after the event to thank your client',
      'Politely ask satisfied clients to leave a review',
      'Address any issues immediately and professionally',
      'Learn from feedback to continuously improve'
    ],
    proTip: 'Send a thank-you message the day after with a direct link to leave a review.'
  },
  {
    id: 'reliability',
    icon: Shield,
    title: 'Be Reliable & Trustworthy',
    subtitle: 'Your reputation is your most valuable asset',
    tips: [
      'Never cancel unless it is an absolute emergency',
      'If you must cancel, give as much notice as possible',
      'Always deliver what you promised',
      'Be honest about your capabilities and availability',
      'Handle payments and refunds fairly and transparently'
    ],
    proTip: 'Build a network of backup professionals you can refer if you are unavailable - clients appreciate the help.'
  },
  {
    id: 'growth',
    icon: Award,
    title: 'Grow Your Business',
    subtitle: 'Continuous improvement leads to more bookings',
    tips: [
      'Keep your profile and photos up to date',
      'Add new packages as you expand your services',
      'Respond to seasonal demand with special offerings',
      'Track what works and adjust your pricing accordingly',
      'Invest in quality equipment and ongoing training'
    ],
    proTip: 'Premium members get AI analytics to see which packages perform best - use data to optimize your offerings.'
  }
];

export default function EventProBestPractices() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentPractice = bestPractices[currentStep];
  const progress = ((completedSteps.size) / bestPractices.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < bestPractices.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    navigate('/vendor-dashboard');
  };

  const Icon = currentPractice.icon;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vendor-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Event Pro Best Practices</h1>
              <p className="text-muted-foreground">Learn how to succeed and get more bookings</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.size} of {bestPractices.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {bestPractices.map((practice, index) => {
                const StepIcon = practice.icon;
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;
                
                return (
                  <button
                    key={practice.id}
                    onClick={() => setCurrentStep(index)}
                    className={`flex flex-col items-center gap-1 transition-all ${
                      isCurrent 
                        ? 'text-primary' 
                        : isCompleted 
                          ? 'text-trust' 
                          : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                          ? 'bg-trust/10 text-trust' 
                          : 'bg-secondary'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs hidden sm:block">{index + 1}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6 sm:p-8">
                {/* Section Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{currentPractice.title}</h2>
                    <p className="text-muted-foreground">{currentPractice.subtitle}</p>
                  </div>
                </div>

                {/* Tips List */}
                <div className="space-y-3 mb-6">
                  {currentPractice.tips.map((tip, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <CheckCircle className="w-5 h-5 text-trust shrink-0 mt-0.5" />
                      <span className="text-sm">{tip}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Pro Tip */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ThumbsUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Pro Tip</p>
                      <p className="text-sm text-muted-foreground">{currentPractice.proTip}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === bestPractices.length - 1 ? (
            <Button onClick={handleComplete}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete & Go to Dashboard
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Why Best Practices Matter
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">85%</p>
                <p className="text-xs text-muted-foreground">of bookings come from reviews</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-trust">3x</p>
                <p className="text-xs text-muted-foreground">more repeat clients with fast responses</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-accent">60%</p>
                <p className="text-xs text-muted-foreground">of clients value punctuality most</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">92%</p>
                <p className="text-xs text-muted-foreground">rebook reliable professionals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
