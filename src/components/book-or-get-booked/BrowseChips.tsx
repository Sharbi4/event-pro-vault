import { Link } from 'react-router-dom';

const groups = [
  {
    title: 'By Vendor type',
    items: [
      ['Food Trucks', '/browse?category=food-truck'],
      ['Food Trailers', '/browse?category=food-trailer'],
      ['Mobile Bartenders', '/browse?category=mobile-bartender'],
      ['Cottage Bakers', '/browse?category=cottage-baker'],
      ['Dessert Vendors', '/browse?category=dessert'],
      ['Mobile Coffee', '/browse?category=mobile-coffee'],
      ['Mobile Food Businesses', '/browse?category=mobile-food'],
    ],
  },
  {
    title: 'By occasion',
    items: [
      ['Apartment event', '/browse?occasion=apartment'],
      ['Office lunch', '/browse?occasion=office'],
      ['Birthday party', '/browse?occasion=birthday'],
      ['Wedding', '/browse?occasion=wedding'],
      ['Graduation', '/browse?occasion=graduation'],
      ['Corporate event', '/browse?occasion=corporate'],
      ['Market or pop-up', '/browse?occasion=market'],
      ['Neighborhood event', '/browse?occasion=neighborhood'],
    ],
  },
  {
    title: 'By timing',
    items: [
      ['Available today', '/browse?timing=today'],
      ['Available this weekend', '/browse?timing=weekend'],
      ['Available next week', '/browse?timing=next-week'],
      ['Flexible dates', '/browse?timing=flexible'],
      ['Next available', '/browse?timing=next'],
    ],
  },
  {
    title: 'By cuisine',
    items: [
      ['Tacos', '/browse?cuisine=tacos'],
      ['BBQ', '/browse?cuisine=bbq'],
      ['Burgers', '/browse?cuisine=burgers'],
      ['Pizza', '/browse?cuisine=pizza'],
      ['Brunch', '/browse?cuisine=brunch'],
      ['Desserts', '/browse?cuisine=desserts'],
      ['Coffee', '/browse?cuisine=coffee'],
      ['Vegan', '/browse?cuisine=vegan'],
      ['Seafood', '/browse?cuisine=seafood'],
      ['Wings', '/browse?cuisine=wings'],
    ],
  },
];

interface Props {
  compact?: boolean;
  title?: string;
}

export function BrowseChips({ compact = false, title = 'Find the right food Vendor faster' }: Props) {
  const visible = compact ? groups.slice(0, 2) : groups;
  return (
    <section className={compact ? 'py-8' : 'py-16 sm:py-24 bg-secondary/30'}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 text-muted-foreground">Jump straight to Vendors that fit your event.</p>
        </div>
        <div className="space-y-8">
          {visible.map((g) => (
            <div key={g.title}>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                {g.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map(([label, href]) => (
                  <Link
                    key={label}
                    to={href}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border border-border/70 bg-background hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
