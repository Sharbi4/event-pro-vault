import { Vendor, Package, Review } from '@/types';

export const vendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Blaze & Grill Co.',
    categories: ['food-trucks'],
    location: 'Los Angeles, CA',
    serviceRadius: 50,
    bio: 'Award-winning BBQ food truck bringing authentic Texas-style smokehouse flavors to LA. 10+ years of experience catering events from intimate backyard gatherings to 500+ guest festivals.',
    gallery: [
      'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800'
    ],
    badges: ['Top Rated', 'Fast Response'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 234,
    responseTime: '< 1 hour',
    cancellationPolicy: 'Full refund 7+ days before event, 50% refund 3-7 days, no refund under 3 days',
    travelFeeRules: 'Free within 25 miles, $2/mile beyond',
    instantBook: true,
    featured: true
  },
  {
    id: 'v2',
    name: 'DJ Quantum',
    categories: ['djs'],
    location: 'Miami, FL',
    serviceRadius: 75,
    bio: 'Professional DJ with 15 years of experience spinning at top clubs, weddings, and corporate events. Specializing in House, Hip-Hop, Latin, and Top 40. Full sound and lighting packages available.',
    gallery: [
      'https://images.unsplash.com/photo-1571266028243-d220c6d6c0db?w=800',
      'https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800'
    ],
    badges: ['Verified', 'Popular'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.8,
    reviewCount: 189,
    responseTime: '< 2 hours',
    cancellationPolicy: 'Full refund 14+ days before event, 50% refund 7-14 days',
    travelFeeRules: 'Free within 30 miles, negotiable beyond',
    instantBook: true,
    featured: true
  },
  {
    id: 'v3',
    name: 'Mixology Masters',
    categories: ['bartending'],
    location: 'New York, NY',
    serviceRadius: 40,
    bio: 'Premium mobile bartending service crafting unforgettable cocktail experiences. Our certified mixologists bring the bar to you with custom menus, premium spirits, and stunning presentation.',
    gallery: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800'
    ],
    badges: ['Premium', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 312,
    responseTime: '< 30 mins',
    cancellationPolicy: 'Full refund 10+ days before event',
    travelFeeRules: 'Free within Manhattan, $50 flat fee other boroughs',
    instantBook: false,
    featured: true
  },
  {
    id: 'v4',
    name: 'Chef Isabella',
    categories: ['private-chefs', 'catering'],
    location: 'San Francisco, CA',
    serviceRadius: 35,
    bio: 'Michelin-trained private chef offering intimate dining experiences. Specializing in farm-to-table California cuisine, Mediterranean, and plant-based menus. Perfect for dinner parties, proposals, and special celebrations.',
    gallery: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=800'
    ],
    badges: ['Elite', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 5.0,
    reviewCount: 87,
    responseTime: '< 4 hours',
    cancellationPolicy: 'Custom policy per booking',
    travelFeeRules: '$25 flat fee outside SF proper',
    instantBook: false,
    featured: true
  },
  {
    id: 'v5',
    name: 'The Magic of Marco',
    categories: ['performers'],
    location: 'Las Vegas, NV',
    serviceRadius: 100,
    bio: 'Award-winning close-up magician and illusionist with over 20 years of experience. Featured at Caesar\'s Palace and corporate events for Fortune 500 companies. Unforgettable entertainment guaranteed.',
    gallery: [
      'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
    ],
    badges: ['Award Winner', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 156,
    responseTime: '< 3 hours',
    cancellationPolicy: '50% deposit non-refundable, balance due 14 days before',
    travelFeeRules: 'Included within Vegas, travel package for distant locations',
    instantBook: true,
    featured: false
  },
  {
    id: 'v6',
    name: 'Party Perfect Rentals',
    categories: ['rentals'],
    location: 'Austin, TX',
    serviceRadius: 60,
    bio: 'Your one-stop shop for event rentals. Tables, chairs, linens, tents, bounce houses, photo booths, and more. We deliver, set up, and pick up so you can focus on hosting.',
    gallery: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
    ],
    badges: ['Full Service', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.7,
    reviewCount: 423,
    responseTime: '< 1 hour',
    cancellationPolicy: 'Full refund 5+ days before, 75% 3-5 days',
    travelFeeRules: 'Free delivery within 20 miles, $1.50/mile beyond',
    instantBook: true,
    featured: false
  },
  {
    id: 'v7',
    name: 'Zen Vibes Wellness',
    categories: ['wellness'],
    location: 'Denver, CO',
    serviceRadius: 45,
    bio: 'Bringing peace and balance to your events. Offering yoga sessions, meditation circles, sound healing, and spiritual ceremonies. Perfect for retreats, corporate wellness days, and special occasions.',
    gallery: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
    ],
    badges: ['Certified', 'Popular'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.8,
    reviewCount: 98,
    responseTime: '< 2 hours',
    cancellationPolicy: 'Full refund 48+ hours before',
    travelFeeRules: 'Free within Denver metro',
    instantBook: true,
    featured: false
  },
  {
    id: 'v8',
    name: 'Coastal Catering Co.',
    categories: ['catering', 'food-trucks'],
    location: 'San Diego, CA',
    serviceRadius: 55,
    bio: 'Fresh, coastal-inspired cuisine for events of all sizes. From beachside weddings to corporate lunches, we bring the taste of the coast to you. Sustainable, local ingredients.',
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    badges: ['Sustainable', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.8,
    reviewCount: 267,
    responseTime: '< 1 hour',
    cancellationPolicy: 'Full refund 7+ days before event',
    travelFeeRules: 'Free within San Diego County',
    instantBook: true,
    featured: true
  }
];

export const packages: Package[] = [
  // Blaze & Grill Co. Packages
  {
    id: 'p1',
    vendorId: 'v1',
    name: 'BBQ Essentials',
    description: 'Perfect for small gatherings. Classic BBQ favorites served fresh from the truck.',
    type: 'HOURLY',
    price: 250,
    minUnits: 3,
    includes: ['Brisket', 'Pulled Pork', 'Coleslaw', 'Cornbread', '2 Sides', 'Disposable servingware'],
    addOns: [
      { id: 'a1', name: 'Extra Side', price: 45 },
      { id: 'a2', name: 'Dessert Station', price: 150 }
    ],
    requirements: ['Power outlet within 50ft', 'Flat parking surface'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p2',
    vendorId: 'v1',
    name: 'Full Smokehouse Experience',
    description: 'The complete BBQ experience with premium cuts and all the fixings.',
    type: 'HOURLY',
    price: 450,
    minUnits: 4,
    includes: ['Premium Brisket', 'Pulled Pork', 'Ribs', 'Smoked Chicken', '4 Sides', 'Cornbread', 'Premium Servingware', 'Staff'],
    addOns: [
      { id: 'a3', name: 'Wagyu Upgrade', price: 200 },
      { id: 'a4', name: 'Late Night Tacos', price: 175 }
    ],
    requirements: ['Power outlet', 'Water access', 'Flat parking surface 20x12ft'],
    instantBook: true,
    featured: false
  },
  {
    id: 'p3',
    vendorId: 'v1',
    name: 'Festival Package',
    description: 'Designed for large events and festivals. High-volume service.',
    type: 'DAILY',
    price: 2500,
    minUnits: 1,
    includes: ['Full menu access', 'Unlimited servings (up to 500 guests)', '2 staff members', 'All servingware', 'Setup & cleanup'],
    addOns: [
      { id: 'a5', name: 'Additional Staff', price: 200 },
      { id: 'a6', name: 'Extended Hours', price: 400 }
    ],
    requirements: ['Generator or 50amp power', 'Water hookup', '30x15ft space'],
    instantBook: false,
    featured: true
  },
  // DJ Quantum Packages
  {
    id: 'p4',
    vendorId: 'v2',
    name: 'Essential Beats',
    description: 'DJ services with basic sound system. Perfect for house parties.',
    type: 'HOURLY',
    price: 175,
    minUnits: 3,
    includes: ['Professional DJ', 'Basic PA System', 'Microphone', 'Music Library'],
    addOns: [
      { id: 'a7', name: 'Extra Speaker', price: 75 },
      { id: 'a8', name: 'Fog Machine', price: 50 }
    ],
    requirements: ['Power outlet', 'Indoor or covered area'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p5',
    vendorId: 'v2',
    name: 'Club Experience',
    description: 'Full club-quality sound and lighting. Turn any venue into a nightclub.',
    type: 'HOURLY',
    price: 350,
    minUnits: 4,
    includes: ['Professional DJ', 'Premium Sound System', 'Moving Head Lights', 'Laser Effects', 'Fog Machine', '2 Microphones'],
    addOns: [
      { id: 'a9', name: 'LED Dance Floor', price: 500 },
      { id: 'a10', name: 'CO2 Cannon', price: 150 }
    ],
    requirements: ['Dedicated 20amp circuit', '10x10ft DJ area', 'Indoor venue'],
    instantBook: true,
    featured: false
  },
  {
    id: 'p6',
    vendorId: 'v2',
    name: 'Festival Headliner',
    description: 'Stadium-level production for major events.',
    type: 'DAILY',
    price: 3500,
    minUnits: 1,
    includes: ['Celebrity DJ performance', 'Festival-grade sound', 'Full lighting rig', 'Pyro effects', 'Tech rider fulfillment', 'Sound engineer'],
    addOns: [
      { id: 'a11', name: 'Live Drummer', price: 800 },
      { id: 'a12', name: 'MC/Hype Man', price: 500 }
    ],
    requirements: ['Stage', 'Power distribution', 'Sound engineer coordination'],
    instantBook: false,
    featured: false
  },
  // Mixology Masters Packages
  {
    id: 'p7',
    vendorId: 'v3',
    name: 'Cocktail Hour',
    description: 'Perfect for intimate gatherings. Craft cocktails made to order.',
    type: 'HOURLY',
    price: 200,
    minUnits: 2,
    includes: ['1 Bartender', '3 Signature Cocktails', 'Basic Spirits', 'Glassware', 'Ice', 'Garnishes'],
    addOns: [
      { id: 'a13', name: 'Premium Spirit Upgrade', price: 150 },
      { id: 'a14', name: 'Champagne Toast', price: 100 }
    ],
    requirements: ['Table for bar setup', 'Nearby water access'],
    instantBook: false,
    featured: true
  },
  {
    id: 'p8',
    vendorId: 'v3',
    name: 'Open Bar Premium',
    description: 'Full open bar experience with top-shelf spirits.',
    type: 'HOURLY',
    price: 450,
    minUnits: 4,
    includes: ['2 Bartenders', 'Unlimited Cocktails', 'Premium Spirits', 'Wine & Beer', 'Portable Bar', 'All Equipment'],
    addOns: [
      { id: 'a15', name: 'Specialty Cocktail Menu', price: 200 },
      { id: 'a16', name: 'Cigar Pairing', price: 350 }
    ],
    requirements: ['10x6ft space', 'Power outlet', 'Water within 25ft'],
    instantBook: false,
    featured: false
  },
  // Chef Isabella Packages
  {
    id: 'p9',
    vendorId: 'v4',
    name: 'Intimate Dinner',
    description: 'Multi-course chef\'s table experience for up to 8 guests.',
    type: 'DAILY',
    price: 1200,
    minUnits: 1,
    includes: ['5-Course Tasting Menu', 'Wine Pairings', 'Chef\'s Greeting', 'All Ingredients', 'Kitchen Cleanup'],
    addOns: [
      { id: 'a17', name: 'Cheese Course', price: 150 },
      { id: 'a18', name: 'Premium Wine Upgrade', price: 300 }
    ],
    requirements: ['Full kitchen access', 'Minimum 4 guests'],
    instantBook: false,
    featured: true
  },
  {
    id: 'p10',
    vendorId: 'v4',
    name: 'Cocktail Party',
    description: 'Passed appetizers and small plates for up to 30 guests.',
    type: 'HOURLY',
    price: 350,
    minUnits: 3,
    includes: ['8 Varieties of Passed Apps', '2 Stationary Displays', 'All Servingware', 'Service Staff'],
    addOns: [
      { id: 'a19', name: 'Raw Bar', price: 400 },
      { id: 'a20', name: 'Carving Station', price: 250 }
    ],
    requirements: ['Kitchen access', 'Warming area'],
    instantBook: false,
    featured: false
  },
  // Party Perfect Rentals Packages
  {
    id: 'p11',
    vendorId: 'v6',
    name: 'Basic Party Pack',
    description: 'Essential rentals for backyard parties up to 30 guests.',
    type: 'DAILY',
    price: 350,
    minUnits: 1,
    includes: ['5 Round Tables', '30 Chairs', 'White Linens', 'Delivery & Pickup'],
    addOns: [
      { id: 'a21', name: 'Chair Covers', price: 75 },
      { id: 'a22', name: 'Uplighting (4 units)', price: 120 }
    ],
    requirements: ['Access for delivery truck'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p12',
    vendorId: 'v6',
    name: 'Kids Party Deluxe',
    description: 'Everything for an epic kids party.',
    type: 'DAILY',
    price: 550,
    minUnits: 1,
    includes: ['Bounce House', 'Kids Tables & Chairs (20)', 'Cotton Candy Machine', 'Popcorn Machine', 'Delivery & Setup'],
    addOns: [
      { id: 'a23', name: 'Snow Cone Machine', price: 75 },
      { id: 'a24', name: 'Balloon Arch', price: 150 }
    ],
    requirements: ['Flat outdoor space 20x20ft', 'Power outlet'],
    instantBook: true,
    featured: false
  },
  {
    id: 'p13',
    vendorId: 'v6',
    name: 'Wedding Elegance',
    description: 'Premium rentals for weddings up to 150 guests.',
    type: 'DAILY',
    price: 2800,
    minUnits: 1,
    includes: ['150 Chiavari Chairs', '15 Round Tables', 'Premium Linens', '40x60 Tent', 'Dance Floor', 'Lighting Package', 'Full Setup & Strike'],
    addOns: [
      { id: 'a25', name: 'Chandeliers (3)', price: 450 },
      { id: 'a26', name: 'Lounge Furniture Set', price: 350 }
    ],
    requirements: ['Site visit required', 'Clear 60x80ft area'],
    instantBook: false,
    featured: false
  }
];

export const reviews: Review[] = [
  {
    id: 'r1',
    vendorId: 'v1',
    bookingId: 'b1',
    userId: 'u1',
    userName: 'Sarah M.',
    rating: 5,
    text: 'Absolutely incredible! The brisket was perfectly smoked and the service was top-notch. Our guests are still talking about it weeks later.',
    createdAt: '2024-01-15',
    packageName: 'Full Smokehouse Experience'
  },
  {
    id: 'r2',
    vendorId: 'v1',
    bookingId: 'b2',
    userId: 'u2',
    userName: 'Mike T.',
    rating: 5,
    text: 'Hired them for our company picnic. Professional, on-time, and the food was phenomenal. Will definitely book again.',
    createdAt: '2024-01-10',
    packageName: 'BBQ Essentials'
  },
  {
    id: 'r3',
    vendorId: 'v2',
    bookingId: 'b3',
    userId: 'u3',
    userName: 'Jessica L.',
    rating: 5,
    text: 'DJ Quantum made our wedding reception unforgettable. Read the crowd perfectly and kept everyone dancing all night!',
    createdAt: '2024-01-20',
    packageName: 'Club Experience'
  },
  {
    id: 'r4',
    vendorId: 'v3',
    bookingId: 'b4',
    userId: 'u4',
    userName: 'David K.',
    rating: 5,
    text: 'The cocktails were works of art. Our guests were blown away by the presentation and taste. Truly elevated our event.',
    createdAt: '2024-01-18',
    packageName: 'Open Bar Premium'
  },
  {
    id: 'r5',
    vendorId: 'v4',
    bookingId: 'b5',
    userId: 'u5',
    userName: 'Amanda R.',
    rating: 5,
    text: 'Chef Isabella created the most memorable dining experience for my husband\'s birthday. Every course was perfection.',
    createdAt: '2024-01-22',
    packageName: 'Intimate Dinner'
  }
];
