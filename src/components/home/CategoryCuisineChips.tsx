import { useNavigate } from 'react-router-dom';
import { serviceCategories } from '@/data/service-categories';

const CUISINES = ['Tacos', 'BBQ', 'Burgers', 'Pizza', 'Brunch', 'Desserts', 'Coffee', 'Vegan', 'Latin', 'Wings', 'Seafood'];

export function CategoryCuisineChips() {
  const navigate = useNavigate();

  return (
    <section className="py-6 border-b border-border/40">
      <div className="container mx-auto px-4 space-y-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {serviceCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(c.name)}`)}
                className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => navigate(`/browse?q=${encodeURIComponent(c)}`)}
                className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/70 transition-colors text-xs font-medium whitespace-nowrap text-muted-foreground hover:text-foreground"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
