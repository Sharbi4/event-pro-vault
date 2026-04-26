import {
  Truck, UtensilsCrossed, ChefHat, Wine, Coffee, IceCream, Store, Cake, CakeSlice, Cookie, MoreHorizontal, LucideIcon
} from 'lucide-react';

export interface EventProCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
}

// Food & beverage focused
export const eventProCategories: EventProCategory[] = [
  { id: 'food-truck', name: 'Food Truck', icon: Truck },
  { id: 'caterer', name: 'Caterer', icon: UtensilsCrossed },
  { id: 'private-chef', name: 'Private Chef', icon: ChefHat },
  { id: 'mobile-bartender', name: 'Mobile Bartender', icon: Wine },
  { id: 'mobile-coffee', name: 'Mobile Coffee / Beverage Cart', icon: Coffee },
  { id: 'dessert-vendor', name: 'Dessert Vendor (ice cream, treats)', icon: IceCream },
  { id: 'food-popup', name: 'Food Pop-up Vendor', icon: Store },
  { id: 'cake-baker', name: 'Cake Baker', icon: Cake },
  { id: 'bakery', name: 'Bakery / Cottage Bakery', icon: CakeSlice },
  { id: 'custom-desserts', name: 'Custom Desserts / Pastry Chef', icon: Cookie },
  { id: 'other', name: 'Other Food & Beverage', icon: MoreHorizontal },
];

export const getCategoryById = (id: string): EventProCategory | undefined =>
  eventProCategories.find(cat => cat.id === id);

export const getCategoryIcon = (id: string): LucideIcon => {
  const category = getCategoryById(id);
  return category?.icon || MoreHorizontal;
};
