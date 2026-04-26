import { Category } from '@/types';

// Food & beverage service categories
export const serviceCategories: Category[] = [
  { id: 'food-trucks', name: 'Food Trucks', icon: 'Truck', description: 'Mobile cuisine for any event', count: 156, featured: true },
  { id: 'catering', name: 'Catering', icon: 'UtensilsCrossed', description: 'Full-service event catering', count: 203, featured: true },
  { id: 'private-chefs', name: 'Private Chefs', icon: 'ChefHat', description: 'Personalized culinary experiences', count: 89 },
  { id: 'bartending', name: 'Mobile Bartending', icon: 'Wine', description: 'Bar carts & mobile bar service', count: 124, featured: true },
  { id: 'desserts', name: 'Desserts & Bakers', icon: 'Cake', description: 'Cottage bakers, cakes & treats', count: 72 },
  { id: 'coffee-beverage', name: 'Coffee & Beverage', icon: 'Coffee', description: 'Mobile coffee & drink carts', count: 48 },
  { id: 'ice-cream', name: 'Ice Cream & Treats', icon: 'IceCream', description: 'Ice cream trucks & frozen treats', count: 36 },
  { id: 'food-popup', name: 'Food Pop-ups', icon: 'Store', description: 'Pop-up culinary experiences', count: 41 },
];
