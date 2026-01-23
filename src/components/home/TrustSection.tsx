import { ShieldCheck, CreditCard, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Verified Pros',
    description: 'Every professional is vetted for quality'
  },
  {
    icon: CreditCard,
    title: 'Secure Booking',
    description: 'Payments protected and encrypted'
  },
  {
    icon: Star,
    title: 'Real Reviews',
    description: 'Authentic feedback from bookings'
  },
  {
    icon: Clock,
    title: 'Transparent Pricing',
    description: 'No hidden fees, ever'
  }
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {trustItems.map((item, index) => (
            <motion.div 
              key={item.title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-foreground/5 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
