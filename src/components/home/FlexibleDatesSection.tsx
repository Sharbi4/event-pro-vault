import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Sun, Moon, CalendarRange, Sparkles } from 'lucide-react';
import { format, addDays, nextFriday, nextSunday, nextSaturday } from 'date-fns';

function nextWeekendDate() {
  const today = new Date();
  const day = today.getDay();
  // If today is Sat/Sun, return today; else next Saturday
  if (day === 6 || day === 0) return today;
  return nextSaturday(today);
}

export function FlexibleDatesSection() {
  const navigate = useNavigate();
  const today = new Date();

  const cards = [
    {
      icon: Sun,
      title: 'This weekend',
      subtitle: 'Available Sat or Sun',
      date: format(nextWeekendDate(), 'yyyy-MM-dd'),
    },
    {
      icon: Clock,
      title: 'Tomorrow',
      subtitle: 'Last-minute openings',
      date: format(addDays(today, 1), 'yyyy-MM-dd'),
    },
    {
      icon: Moon,
      title: 'Friday night',
      subtitle: 'Late-night vendors',
      date: format(nextFriday(today), 'yyyy-MM-dd'),
    },
    {
      icon: Sun,
      title: 'Sunday brunch',
      subtitle: 'Brunch & coffee carts',
      date: format(nextSunday(today), 'yyyy-MM-dd'),
    },
    {
      icon: CalendarRange,
      title: 'Within 3 days',
      subtitle: 'Flexible window',
      date: format(addDays(today, 3), 'yyyy-MM-dd'),
    },
    {
      icon: Sparkles,
      title: 'Next available',
      subtitle: 'See what\'s open',
      date: '',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Flexible on timing?
            </h2>
            <p className="text-muted-foreground">
              Don't dead-end on a date — see vendors available nearby in time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.title}
                onClick={() => navigate(c.date ? `/browse?date=${c.date}` : '/browse')}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border p-5 text-left hover:border-primary hover:shadow-lg transition-all"
              >
                <Icon className="w-6 h-6 text-primary mb-3" />
                <div className="font-semibold text-sm mb-0.5">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
