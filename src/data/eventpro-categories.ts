import {
  Truck,
  UtensilsCrossed,
  ChefHat,
  Wine,
  Camera,
  Video,
  Music,
  Guitar,
  Sparkles,
  Wand2,
  Mic2,
  ImageIcon,
  Tent,
  Baby,
  Armchair,
  Lightbulb,
  Flower2,
  CalendarCheck,
  Scissors,
  ShieldCheck,
  Car,
  Sparkle,
  Coffee,
  IceCream,
  Store,
  Cake,
  CakeSlice,
  Cookie,
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
  { id: 'food-truck', name: 'Food Truck', icon: Truck },
  { id: 'caterer', name: 'Caterer', icon: UtensilsCrossed },
  { id: 'private-chef', name: 'Private Chef', icon: ChefHat },
  { id: 'mobile-bartender', name: 'Mobile Bartender', icon: Wine },
  { id: 'photographer', name: 'Photographer', icon: Camera },
  { id: 'videographer', name: 'Videographer', icon: Video },
  { id: 'dj', name: 'DJ', icon: Music },
  { id: 'live-musician', name: 'Live Musician / Band', icon: Guitar },
  { id: 'performer', name: 'Performer (general)', icon: Sparkles },
  { id: 'magician', name: 'Magician', icon: Wand2 },
  { id: 'host-mc', name: 'Host / MC', icon: Mic2 },
  { id: 'photo-booth', name: 'Photo Booth', icon: ImageIcon },
  { id: 'event-rentals', name: 'Event Rentals (general)', icon: Tent },
  { id: 'bounce-house', name: 'Bounce House / Inflatable Rentals', icon: Baby },
  { id: 'tent-table-chair', name: 'Tent / Table / Chair Rentals', icon: Armchair },
  { id: 'lighting-av', name: 'Lighting / AV Rentals', icon: Lightbulb },
  { id: 'floral-decor', name: 'Floral / Decor', icon: Flower2 },
  { id: 'event-planner', name: 'Event Planner / Coordinator', icon: CalendarCheck },
  { id: 'hair-makeup', name: 'Hair & Makeup', icon: Scissors },
  { id: 'security', name: 'Security', icon: ShieldCheck },
  { id: 'valet-parking', name: 'Valet / Parking', icon: Car },
  { id: 'cleaning', name: 'Cleaning / Post-event cleanup', icon: Sparkle },
  { id: 'mobile-coffee', name: 'Mobile Coffee / Beverage Cart', icon: Coffee },
  { id: 'dessert-vendor', name: 'Dessert Vendor (ice cream, treats)', icon: IceCream },
  { id: 'food-popup', name: 'Food Pop-up Vendor', icon: Store },
  { id: 'cake-baker', name: 'Cake Baker', icon: Cake },
  { id: 'bakery', name: 'Bakery / Cottage Bakery', icon: CakeSlice },
  { id: 'custom-desserts', name: 'Custom Desserts / Pastry Chef', icon: Cookie },
  { id: 'other', name: 'Other', icon: MoreHorizontal },
];

export const getCategoryById = (id: string): EventProCategory | undefined => {
  return eventProCategories.find(cat => cat.id === id);
};

export const getCategoryIcon = (id: string): LucideIcon => {
  const category = getCategoryById(id);
  return category?.icon || MoreHorizontal;
};
