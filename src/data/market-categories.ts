import { Category } from '@/types';

// Market categories for Market Spaces mode
export const marketCategories: Category[] = [
  {
    id: 'farmers-markets',
    name: 'Farmers Markets',
    icon: 'Leaf',
    description: 'Fresh produce Vendor spaces',
    count: 38,
    featured: true
  },
  {
    id: 'flea-markets',
    name: 'Flea Markets',
    icon: 'Store',
    description: 'Rent Vendor spots & booths',
    count: 45,
    featured: true
  },
  {
    id: 'night-markets',
    name: 'Night Markets',
    icon: 'Moon',
    description: 'Evening market events',
    count: 23,
    featured: true
  },
  {
    id: 'pop-ups',
    name: 'Pop-ups',
    icon: 'Zap',
    description: 'Temporary retail spaces',
    count: 56
  },
  {
    id: 'festivals',
    name: 'Festivals',
    icon: 'PartyPopper',
    description: 'Festival Vendor opportunities',
    count: 34
  },
  {
    id: 'craft-fairs',
    name: 'Craft Fairs',
    icon: 'Palette',
    description: 'Handmade & artisan markets',
    count: 41
  },
  {
    id: 'food-halls',
    name: 'Food Halls',
    icon: 'UtensilsCrossed',
    description: 'Indoor food Vendor spaces',
    count: 18
  },
  {
    id: 'holiday-markets',
    name: 'Holiday Markets',
    icon: 'Gift',
    description: 'Seasonal market events',
    count: 27
  }
];
