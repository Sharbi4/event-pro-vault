import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { categories } from '@/data/categories';
import { 
  Truck, UtensilsCrossed, ChefHat, Wine, 
  Music, Sparkles, Tent, Heart 
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Truck,
  UtensilsCrossed,
  ChefHat,
  Wine,
  Music,
  Sparkles,
  Tent,
  Heart,
};

export function CategoryGrid() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect vendor for your event from our curated categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon];
            return (
              <Link key={category.id} to={`/browse?category=${category.id}`}>
                <Card 
                  variant="glow" 
                  className="p-6 text-center group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center group-hover:glow-gradient transition-all duration-300">
                    {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} pros</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
