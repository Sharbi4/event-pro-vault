import { useRef } from 'react';
import { 
  Truck, UtensilsCrossed, ChefHat, Wine, Music, 
  Sparkles, Tent, Heart, Store, Leaf, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  UtensilsCrossed,
  ChefHat,
  Wine,
  Music,
  Sparkles,
  Tent,
  Heart,
  Store,
  Leaf,
};

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryCarousel({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="border-b border-border bg-card/50">
      <div className="container mx-auto px-4 relative">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-card/90 shadow-md border border-border hidden md:flex"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Categories scroll container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 py-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {/* All category */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex flex-col items-center gap-2 min-w-[64px] group transition-all ${
              !selectedCategory
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-secondary group-hover:bg-secondary/80'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium whitespace-nowrap">All</span>
            <div
              className={`h-0.5 w-full rounded-full transition-all ${
                !selectedCategory ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          </button>

          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Sparkles;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex flex-col items-center gap-2 min-w-[64px] group transition-all ${
                  isSelected
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : category.featured
                      ? 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20'
                      : 'bg-secondary group-hover:bg-secondary/80'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {category.featured && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-trust rounded-full" />
                  )}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
                <div
                  className={`h-0.5 w-full rounded-full transition-all ${
                    isSelected ? 'bg-primary' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-card/90 shadow-md border border-border hidden md:flex"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
