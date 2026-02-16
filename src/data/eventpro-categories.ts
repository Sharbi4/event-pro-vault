import {
  Truck,
  UtensilsCrossed,
  Pizza,
  Coffee,
  IceCream,
  Cake,
  CakeSlice,
  Cookie,
  Beef,
  Fish,
  Soup,
  Salad,
  Sandwich,
  Egg,
  Drumstick,
  Candy,
  Shell,
  Leaf,
  Flame,
  CupSoda,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';

export interface EventProCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
}

export const eventProCategories: EventProCategory[] = [
  { id: 'taco-truck', name: 'Taco Truck', icon: Truck, description: 'Authentic Mexican street food' },
  { id: 'bbq-truck', name: 'BBQ Truck', icon: Flame, description: 'Smoked meats & Southern classics' },
  { id: 'pizza-truck', name: 'Pizza Truck', icon: Pizza, description: 'Wood-fired & artisan pizza' },
  { id: 'burger-truck', name: 'Burger Truck', icon: Beef, description: 'Gourmet burgers & sliders' },
  { id: 'ice-cream-truck', name: 'Ice Cream Truck', icon: IceCream, description: 'Frozen treats & soft serve' },
  { id: 'coffee-truck', name: 'Coffee Truck', icon: Coffee, description: 'Espresso bars & lattes' },
  { id: 'asian-fusion', name: 'Asian Fusion Truck', icon: Soup, description: 'Korean, Thai, Japanese & more' },
  { id: 'dessert-truck', name: 'Dessert Truck', icon: Cake, description: 'Cupcakes, donuts & treats' },
  { id: 'seafood-truck', name: 'Seafood Truck', icon: Fish, description: 'Lobster rolls & fish tacos' },
  { id: 'cotton-candy', name: 'Cotton Candy Cart', icon: Candy, description: 'Gourmet cotton candy' },
  { id: 'catering-truck', name: 'Catering Truck', icon: UtensilsCrossed, description: 'Full-service mobile catering' },
  { id: 'smoothie-truck', name: 'Smoothie & Juice Truck', icon: CupSoda, description: 'Fresh juices & açaí bowls' },
  { id: 'sandwich-truck', name: 'Sandwich Truck', icon: Sandwich, description: 'Subs, wraps & gourmet sandwiches' },
  { id: 'chicken-truck', name: 'Chicken & Wings Truck', icon: Drumstick, description: 'Fried chicken & wings' },
  { id: 'crepe-truck', name: 'Crêpe & Waffle Truck', icon: CakeSlice, description: 'Sweet & savory crêpes' },
  { id: 'mediterranean-truck', name: 'Mediterranean Truck', icon: Salad, description: 'Falafel, gyros & kebabs' },
  { id: 'vegan-truck', name: 'Vegan / Plant-Based', icon: Leaf, description: '100% plant-based mobile food' },
  { id: 'breakfast-truck', name: 'Breakfast Truck', icon: Egg, description: 'Morning burritos & pancakes' },
  { id: 'lobster-truck', name: 'Lobster & Crab Truck', icon: Shell, description: 'Lobster rolls & crab cakes' },
  { id: 'bakery-truck', name: 'Bakery Truck', icon: Cookie, description: 'Fresh pastries & baked goods' },
  { id: 'other', name: 'Other', icon: MoreHorizontal, description: 'Other mobile food vendor' },
];

export const getCategoryById = (id: string): EventProCategory | undefined => {
  return eventProCategories.find(cat => cat.id === id);
};

export const getCategoryIcon = (id: string): LucideIcon => {
  const category = getCategoryById(id);
  return category?.icon || MoreHorizontal;
};
