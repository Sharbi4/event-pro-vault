import { Search, Package, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Discover',
    description: 'Browse curated professionals. Filter by category, location, and budget.'
  },
  {
    icon: Package,
    step: '02',
    title: 'Choose',
    description: 'Select from ready-to-book packages or request a custom quote.'
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Book',
    description: 'Secure your date with protected payments. Get instant confirmation.'
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Secure your date in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div 
              key={step.step} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center shadow-elevated">
                  <step.icon className="w-9 h-9 text-background" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background text-foreground font-bold text-sm flex items-center justify-center shadow-soft border border-border">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
