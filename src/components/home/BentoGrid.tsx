import { BentoCard } from './BentoCard';
import { motion } from 'framer-motion';

// Featured items for the bento grid
const bentoItems = [
  {
    title: 'DJ & Music',
    subtitle: 'Set the vibe',
    price: 'From $200',
    image: 'https://images.unsplash.com/photo-1571266028243-d220c6a8b0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/browse?category=dj',
    size: 'tall' as const,
  },
  {
    title: 'Photography',
    subtitle: 'Capture the moment',
    price: 'From $350',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/browse?category=photography',
    size: 'square' as const,
  },
  {
    title: 'Catering',
    subtitle: 'Taste perfection',
    price: 'From $25/guest',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    href: '/browse?category=catering',
    size: 'wide' as const,
  },
  {
    title: 'Bartending',
    subtitle: 'Craft cocktails',
    price: 'From $300',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    href: '/browse?category=bartending',
    size: 'wide' as const,
  },
  {
    title: 'Florals',
    subtitle: 'Stunning arrangements',
    price: 'From $150',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/browse?category=florals',
    size: 'square' as const,
  },
  {
    title: 'Venues',
    subtitle: 'The perfect space',
    price: 'From $500',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/browse?category=venues',
    size: 'tall' as const,
  },
];

export function BentoGrid() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Explore experiences
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Curated professionals for every occasion
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
          {bentoItems.map((item, index) => (
            <BentoCard
              key={item.title}
              {...item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
