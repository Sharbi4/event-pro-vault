export type PackageType = 'HOURLY' | 'DAILY';

export interface Vendor {
  id: string;
  name: string;
  categories: string[];
  location: string;
  serviceRadius: number;
  bio: string;
  gallery: string[];
  badges: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  insuranceStatus: boolean;
  avgRating: number;
  reviewCount: number;
  responseTime: string;
  cancellationPolicy: string;
  travelFeeRules: string;
  instantBook: boolean;
  featured: boolean;
}

export interface Package {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  type: PackageType;
  price: number;
  minUnits: number;
  includes: string[];
  addOns: AddOn[];
  requirements: string[];
  instantBook: boolean;
  featured: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Booking {
  id: string;
  packageId: string;
  vendorId: string;
  userId: string;
  startDateTime: string;
  endDateTime: string;
  units: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  eventDetails: string;
  notes: string;
  addOnsSelected: string[];
}

export interface Review {
  id: string;
  vendorId: string;
  bookingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  createdAt: string;
  packageName?: string;
}

export interface MessageThread {
  id: string;
  bookingId?: string;
  inquiryId?: string;
  participants: string[];
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}
