import { Search, Package, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Discover',
    description: 'Browse our curated selection of food trucks. Filter by cuisine, location, and budget.'
  },
  {
    icon: Package,
    step: '02',
    title: 'Choose Package',
    description: 'Select from ready-to-book packages or request a custom quote tailored to your event.'
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Book & Pay',
    description: 'Secure your booking with protected payments. Get instant confirmation and direct messaging.'
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book the perfect food truck in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />
          
          {steps.map((step, index) => (
            <div 
              key={step.step} 
              className="text-center relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg glow-gradient">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold text-sm flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
