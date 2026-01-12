import { ShieldCheck, CreditCard, Star, Clock } from 'lucide-react';

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Verified Vendors',
    description: 'Every vendor is vetted for quality and reliability'
  },
  {
    icon: CreditCard,
    title: 'Secure Booking',
    description: 'Your payments are protected and encrypted'
  },
  {
    icon: Star,
    title: 'Real Reviews',
    description: 'Authentic feedback from verified bookings'
  },
  {
    icon: Clock,
    title: 'Transparent Pricing',
    description: 'No hidden fees, clear hourly or daily rates'
  }
];

export function TrustSection() {
  return (
    <section className="py-16 border-y border-border bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div 
              key={item.title} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-trust/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-trust" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
