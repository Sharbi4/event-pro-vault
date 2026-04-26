import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/data/categories';
import {
  Truck, UtensilsCrossed, ChefHat, Wine, Coffee, IceCream, Store, Cake
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Truck,
  UtensilsCrossed,
  ChefHat,
  Wine,
  Coffee,
  IceCream,
  Store,
  Cake,
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
            Find the perfect Vendor for your event from our curated categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon];
            return (
              <Link key={category.id} to={`/browse?category=${category.id}`}>
                <Card 
                  variant="glow" 
                  className={`p-6 text-center group cursor-pointer animate-fade-in relative ${category.featured ? 'ring-2 ring-primary/50' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {category.featured && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent text-white text-xs">
                      Featured
                    </Badge>
                  )}
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:glow-gradient transition-all duration-300 ${category.featured ? 'bg-gradient-to-br from-primary via-accent to-primary' : 'gradient-primary'}`}>
                    {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} {category.featured ? 'markets' : 'pros'}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
