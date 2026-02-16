import { Category } from '@/types';

// Core food truck & mobile food categories for the browse carousel
export const serviceCategories: Category[] = [
  {
    id: 'taco-trucks',
    name: 'Taco Trucks',
    icon: 'Truck',
    description: 'Authentic Mexican street food',
    count: 203,
    featured: true
  },
  {
    id: 'bbq-trucks',
    name: 'BBQ Trucks',
    icon: 'Flame',
    description: 'Smoked meats & Southern classics',
    count: 178,
    featured: true
  },
  {
    id: 'pizza-trucks',
    name: 'Pizza Trucks',
    icon: 'Pizza',
    description: 'Wood-fired & artisan pizza',
    count: 145,
    featured: true
  },
  {
    id: 'burger-trucks',
    name: 'Burger Trucks',
    icon: 'Beef',
    description: 'Gourmet burgers & sliders',
    count: 167
  },
  {
    id: 'ice-cream-trucks',
    name: 'Ice Cream',
    icon: 'IceCream',
    description: 'Frozen treats & desserts',
    count: 134
  },
  {
    id: 'coffee-trucks',
    name: 'Coffee & Drinks',
    icon: 'Coffee',
    description: 'Espresso bars & specialty drinks',
    count: 112
  },
  {
    id: 'asian-trucks',
    name: 'Asian Fusion',
    icon: 'Soup',
    description: 'Korean, Thai, Japanese & more',
    count: 156
  },
  {
    id: 'dessert-trucks',
    name: 'Desserts',
    icon: 'Cake',
    description: 'Cupcakes, donuts, crêpes & sweet treats',
    count: 98
  },
  {
    id: 'seafood-trucks',
    name: 'Seafood',
    icon: 'Fish',
    description: 'Lobster rolls, fish tacos & more',
    count: 87
  },
  {
    id: 'event-carts',
    name: 'Event Carts',
    icon: 'ShoppingCart',
    description: 'Cotton candy, popcorn, churros & more',
    count: 95,
    featured: true
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: 'ConciergeBell',
    description: 'Full-service catering for any event',
    count: 210,
    featured: true
  },
  {
    id: 'private-chef',
    name: 'Private Chef',
    icon: 'ChefHat',
    description: 'Personal chefs for intimate events',
    count: 78
  },
  {
    id: 'shawarma-trucks',
    name: 'Shawarma',
    icon: 'Beef',
    description: 'Mediterranean wraps & platters',
    count: 45
  },
  {
    id: 'other',
    name: 'More',
    icon: 'MoreHorizontal',
    description: 'Other mobile food vendors',
    count: 234
  }
];
