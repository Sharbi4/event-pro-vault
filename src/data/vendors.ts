import { Vendor, Package, Review } from '@/types';

export const Vendors: Vendor[] = [
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
  },
  // Los Angeles Vendors
  {
    id: 'v9',
    name: 'LA Lens Photography',
    categories: ['photography'],
    location: 'Los Angeles, CA',
    serviceRadius: 60,
    bio: 'Award-winning wedding and event photography studio. Our team of talented photographers captures every precious moment with artistic flair and technical excellence.',
    gallery: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'
    ],
    badges: ['Top Rated', 'Award Winner', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 445,
    responseTime: '< 2 hours',
    cancellationPolicy: 'Full refund 30+ days before, 50% 14-30 days',
    travelFeeRules: 'Free within LA County, $1/mile beyond',
    instantBook: true,
    featured: true
  },
  {
    id: 'v10',
    name: 'Hollywood DJ Collective',
    categories: ['djs'],
    location: 'Los Angeles, CA',
    serviceRadius: 75,
    bio: 'Premier DJ collective serving the entertainment capital. From celebrity parties to intimate weddings, we bring the beats that make memories. Full production available.',
    gallery: [
      'https://images.unsplash.com/photo-1571266028243-d220c6d6c0db?w=800',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
    ],
    badges: ['Celebrity Choice', 'Verified', 'Popular'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.8,
    reviewCount: 312,
    responseTime: '< 1 hour',
    cancellationPolicy: 'Full refund 14+ days before event',
    travelFeeRules: 'Free within 40 miles of Hollywood',
    instantBook: true,
    featured: true
  },
  {
    id: 'v11',
    name: 'Sunset Blooms Florals',
    categories: ['florals'],
    location: 'Los Angeles, CA',
    serviceRadius: 45,
    bio: 'Luxury floral design studio specializing in weddings and high-end events. We create stunning arrangements that transform spaces and leave lasting impressions.',
    gallery: [
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800',
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800'
    ],
    badges: ['Luxury', 'Verified', 'Top Rated'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 5.0,
    reviewCount: 178,
    responseTime: '< 4 hours',
    cancellationPolicy: 'Custom policy per event',
    travelFeeRules: 'Free delivery in LA proper',
    instantBook: false,
    featured: true
  },
  // Houston Vendors
  {
    id: 'v12',
    name: 'H-Town BBQ Kings',
    categories: ['food-trucks', 'catering'],
    location: 'Houston, TX',
    serviceRadius: 65,
    bio: 'Authentic Texas BBQ with a Houston twist. Award-winning brisket, ribs, and all the fixings. Catering events from 20 to 2000+ guests with true Southern hospitality.',
    gallery: [
      'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'
    ],
    badges: ['Award Winner', 'Top Rated', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 567,
    responseTime: '< 1 hour',
    cancellationPolicy: 'Full refund 7+ days before event',
    travelFeeRules: 'Free within Houston metro, $2/mile beyond',
    instantBook: true,
    featured: true
  },
  {
    id: 'v13',
    name: 'Space City Events',
    categories: ['rentals', 'decor'],
    location: 'Houston, TX',
    serviceRadius: 70,
    bio: 'Full-service event rentals and decor for Houston and beyond. Tents, tables, chairs, linens, lighting, and complete event styling. Making your vision a reality.',
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800'
    ],
    badges: ['Full Service', 'Verified', 'Popular'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.7,
    reviewCount: 389,
    responseTime: '< 2 hours',
    cancellationPolicy: 'Full refund 10+ days before',
    travelFeeRules: 'Free delivery within 30 miles',
    instantBook: true,
    featured: true
  },
  {
    id: 'v14',
    name: 'Bayou Beats DJ',
    categories: ['djs'],
    location: 'Houston, TX',
    serviceRadius: 55,
    bio: 'Houston\'s favorite DJ for weddings, quinceañeras, and corporate events. Bilingual MC services available. We keep the dance floor packed all night long!',
    gallery: [
      'https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800'
    ],
    badges: ['Bilingual', 'Verified', 'Fast Response'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.8,
    reviewCount: 234,
    responseTime: '< 30 mins',
    cancellationPolicy: 'Full refund 7+ days before',
    travelFeeRules: 'Free within Harris County',
    instantBook: true,
    featured: false
  },
  // Atlanta Vendors
  {
    id: 'v15',
    name: 'Peach State Catering',
    categories: ['catering', 'private-chefs'],
    location: 'Atlanta, GA',
    serviceRadius: 50,
    bio: 'Southern cuisine with a modern twist. From elegant plated dinners to casual buffets, we bring farm-to-table flavors to your special occasions. James Beard nominated chef.',
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    ],
    badges: ['Award Winning', 'Elite', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 412,
    responseTime: '< 3 hours',
    cancellationPolicy: 'Custom policy per event',
    travelFeeRules: 'Free within Atlanta metro',
    instantBook: false,
    featured: true
  },
  {
    id: 'v16',
    name: 'ATL Photo Studio',
    categories: ['photography', 'videography'],
    location: 'Atlanta, GA',
    serviceRadius: 60,
    bio: 'Capturing Atlanta\'s most beautiful moments. Wedding photography, event coverage, and cinematic videography. Modern, documentary-style approach with timeless results.',
    gallery: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
    ],
    badges: ['Top Rated', 'Verified', 'Popular'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.8,
    reviewCount: 298,
    responseTime: '< 2 hours',
    cancellationPolicy: 'Full refund 21+ days before',
    travelFeeRules: 'Free within 30 miles of Atlanta',
    instantBook: true,
    featured: true
  },
  {
    id: 'v17',
    name: 'Southern Charm Events',
    categories: ['rentals', 'florals'],
    location: 'Atlanta, GA',
    serviceRadius: 55,
    bio: 'Elegant event rentals and floral design with authentic Southern charm. Specializing in weddings, garden parties, and upscale corporate events throughout Georgia.',
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800'
    ],
    badges: ['Luxury', 'Verified', 'Top Rated'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 187,
    responseTime: '< 4 hours',
    cancellationPolicy: 'Full refund 14+ days before',
    travelFeeRules: 'Free within metro Atlanta',
    instantBook: false,
    featured: true
  },
  // Chicago Vendors
  {
    id: 'v18',
    name: 'Windy City DJs',
    categories: ['djs'],
    location: 'Chicago, IL',
    serviceRadius: 65,
    bio: 'Chicago\'s premier DJ and entertainment company. From rooftop parties to ballroom weddings, we bring the energy and expertise to make your event unforgettable.',
    gallery: [
      'https://images.unsplash.com/photo-1571266028243-d220c6d6c0db?w=800',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
    ],
    badges: ['Top Rated', 'Verified', 'Award Winner'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 521,
    responseTime: '< 1 hour',
    cancellationPolicy: 'Full refund 14+ days before event',
    travelFeeRules: 'Free within Chicagoland area',
    instantBook: true,
    featured: true
  },
  {
    id: 'v19',
    name: 'Chicago Gourmet Catering',
    categories: ['catering'],
    location: 'Chicago, IL',
    serviceRadius: 50,
    bio: 'Fine dining catering for Chicago\'s most discerning clients. Our executive chef crafts seasonal menus featuring the best of Midwest ingredients with global inspiration.',
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=800'
    ],
    badges: ['Elite', 'Verified', 'Award Winning'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 5.0,
    reviewCount: 234,
    responseTime: '< 4 hours',
    cancellationPolicy: 'Custom policy per event',
    travelFeeRules: 'Free within city limits',
    instantBook: false,
    featured: true
  },
  {
    id: 'v20',
    name: 'Lakefront Photo & Film',
    categories: ['photography', 'videography'],
    location: 'Chicago, IL',
    serviceRadius: 70,
    bio: 'Documentary-style wedding photography and cinematic films. We capture the real moments, genuine emotions, and beautiful details that tell your unique story.',
    gallery: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
    ],
    badges: ['Documentary Style', 'Verified', 'Top Rated'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 4.9,
    reviewCount: 345,
    responseTime: '< 2 hours',
    cancellationPolicy: 'Full refund 30+ days before',
    travelFeeRules: 'Free within 50 miles of Chicago',
    instantBook: true,
    featured: true
  },
  {
    id: 'v21',
    name: 'Magnificent Mile Florals',
    categories: ['florals'],
    location: 'Chicago, IL',
    serviceRadius: 45,
    bio: 'Luxury floral design studio on Chicago\'s Magnificent Mile. Creating breathtaking arrangements for weddings, galas, and corporate events. Voted Best Florist in Chicago.',
    gallery: [
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800',
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800'
    ],
    badges: ['Luxury', 'Best in Chicago', 'Verified'],
    verificationStatus: 'verified',
    insuranceStatus: true,
    avgRating: 5.0,
    reviewCount: 156,
    responseTime: '< 3 hours',
    cancellationPolicy: 'Custom policy per event',
    travelFeeRules: 'Free delivery in Chicago',
    instantBook: false,
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
  },
  // LA Lens Photography Packages
  {
    id: 'p14',
    vendorId: 'v9',
    name: 'Engagement Session',
    description: 'Beautiful engagement photos at your favorite LA location.',
    type: 'HOURLY',
    price: 350,
    minUnits: 2,
    includes: ['2-hour session', '50+ edited photos', 'Online gallery', 'Print release', 'Location scouting'],
    addOns: [
      { id: 'a27', name: 'Extra Hour', price: 200 },
      { id: 'a28', name: 'Premium Album', price: 450 }
    ],
    requirements: ['Outdoor location preferred'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p15',
    vendorId: 'v9',
    name: 'Wedding Day Coverage',
    description: 'Comprehensive wedding photography from prep to reception.',
    type: 'HOURLY',
    price: 500,
    minUnits: 8,
    includes: ['Lead photographer', 'Second shooter', '500+ edited photos', 'Online gallery', 'Print release', 'Sneak peeks in 48hrs'],
    addOns: [
      { id: 'a29', name: 'Engagement Session', price: 500 },
      { id: 'a30', name: 'Parent Albums (2)', price: 600 }
    ],
    requirements: ['Vendor meal for photographers'],
    instantBook: false,
    featured: true
  },
  // Hollywood DJ Collective Packages
  {
    id: 'p16',
    vendorId: 'v10',
    name: 'Party Starter',
    description: 'Professional DJ with premium sound for any celebration.',
    type: 'HOURLY',
    price: 275,
    minUnits: 4,
    includes: ['Professional DJ', 'Premium Sound System', 'Wireless Mic', 'LED Uplighting', 'Custom Playlist'],
    addOns: [
      { id: 'a31', name: 'Photo Booth', price: 400 },
      { id: 'a32', name: 'Monogram Projection', price: 150 }
    ],
    requirements: ['Power access', '8x8ft setup space'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p17',
    vendorId: 'v10',
    name: 'Hollywood Production',
    description: 'Red carpet-worthy entertainment with full production.',
    type: 'HOURLY',
    price: 550,
    minUnits: 5,
    includes: ['Celebrity DJ', 'Concert Sound', 'Intelligent Lighting', 'Fog Effects', 'MC Services', 'Coordination'],
    addOns: [
      { id: 'a33', name: 'LED Dance Floor', price: 800 },
      { id: 'a34', name: 'Saxophone Player', price: 500 }
    ],
    requirements: ['Venue coordination required', '200amp power'],
    instantBook: false,
    featured: true
  },
  // Sunset Blooms Florals Packages
  {
    id: 'p18',
    vendorId: 'v11',
    name: 'Bridal Bouquet Package',
    description: 'Stunning bridal and bridesmaid bouquets plus boutonnieres.',
    type: 'DAILY',
    price: 850,
    minUnits: 1,
    includes: ['Bridal Bouquet', '4 Bridesmaid Bouquets', '6 Boutonnieres', 'Flower Girl Basket', 'Consultation'],
    addOns: [
      { id: 'a35', name: 'Corsages (4)', price: 120 },
      { id: 'a36', name: 'Toss Bouquet', price: 85 }
    ],
    requirements: ['2-week advance booking'],
    instantBook: false,
    featured: true
  },
  {
    id: 'p19',
    vendorId: 'v11',
    name: 'Full Wedding Florals',
    description: 'Complete floral design including ceremony and reception.',
    type: 'DAILY',
    price: 3500,
    minUnits: 1,
    includes: ['All Personal Flowers', 'Ceremony Arch', '15 Centerpieces', 'Sweetheart Table', 'Delivery & Setup'],
    addOns: [
      { id: 'a37', name: 'Aisle Petals', price: 200 },
      { id: 'a38', name: 'Hanging Installations', price: 1200 }
    ],
    requirements: ['Venue walkthrough required', '1-month advance booking'],
    instantBook: false,
    featured: true
  },
  // H-Town BBQ Kings Packages
  {
    id: 'p20',
    vendorId: 'v12',
    name: 'Texas Trio',
    description: 'Our signature three-meat combo with classic sides.',
    type: 'HOURLY',
    price: 300,
    minUnits: 3,
    includes: ['Brisket', 'Ribs', 'Sausage', '3 Sides', 'Bread', 'Pickles & Onions', 'Disposables'],
    addOns: [
      { id: 'a39', name: 'Mac & Cheese Bar', price: 150 },
      { id: 'a40', name: 'Banana Pudding', price: 100 }
    ],
    requirements: ['Outdoor space 15x10ft', 'Power outlet'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p21',
    vendorId: 'v12',
    name: 'Pitmaster Experience',
    description: 'Premium all-you-can-eat BBQ with pit demonstration.',
    type: 'HOURLY',
    price: 550,
    minUnits: 4,
    includes: ['All Meats', 'All Sides', 'Pit Demo', '2 Staff', 'Premium Servingware', 'Cleanup'],
    addOns: [
      { id: 'a41', name: 'Craft Beer Pairing', price: 300 },
      { id: 'a42', name: 'Smoked Desserts', price: 175 }
    ],
    requirements: ['Outdoor venue', '20x15ft space', 'Water access'],
    instantBook: false,
    featured: true
  },
  // Space City Events Packages
  {
    id: 'p22',
    vendorId: 'v13',
    name: 'Backyard Basics',
    description: 'Essential rentals for backyard events up to 50 guests.',
    type: 'DAILY',
    price: 450,
    minUnits: 1,
    includes: ['6 Tables', '50 Chairs', 'Linens', 'Delivery', 'Setup & Pickup'],
    addOns: [
      { id: 'a43', name: '20x20 Tent', price: 400 },
      { id: 'a44', name: 'String Lights', price: 150 }
    ],
    requirements: ['Driveway access for truck'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p23',
    vendorId: 'v13',
    name: 'Corporate Event Package',
    description: 'Professional setup for corporate events up to 200 guests.',
    type: 'DAILY',
    price: 1800,
    minUnits: 1,
    includes: ['20 Tables', '200 Chairs', 'Staging', 'Podium', 'AV Support', 'Linens', 'Full Setup'],
    addOns: [
      { id: 'a45', name: 'Red Carpet', price: 200 },
      { id: 'a46', name: 'Step & Repeat Backdrop', price: 350 }
    ],
    requirements: ['Venue coordination', '48hr setup window'],
    instantBook: false,
    featured: false
  },
  // Bayou Beats DJ Packages
  {
    id: 'p24',
    vendorId: 'v14',
    name: 'Fiesta Pack',
    description: 'Perfect for quinceañeras and family celebrations.',
    type: 'HOURLY',
    price: 225,
    minUnits: 4,
    includes: ['Bilingual DJ/MC', 'Sound System', 'Wireless Mics (2)', 'Basic Lighting', 'Music Consultation'],
    addOns: [
      { id: 'a47', name: 'Karaoke Setup', price: 150 },
      { id: 'a48', name: 'LED Dance Floor', price: 500 }
    ],
    requirements: ['Power outlet', 'Covered area recommended'],
    instantBook: true,
    featured: true
  },
  // Peach State Catering Packages
  {
    id: 'p25',
    vendorId: 'v15',
    name: 'Southern Brunch',
    description: 'Elegant brunch service featuring Southern classics.',
    type: 'HOURLY',
    price: 400,
    minUnits: 3,
    includes: ['Shrimp & Grits', 'Biscuits & Gravy', 'Seasonal Fruit', 'Mimosa Bar Setup', 'Staff'],
    addOns: [
      { id: 'a49', name: 'Omelet Station', price: 250 },
      { id: 'a50', name: 'Carving Station', price: 300 }
    ],
    requirements: ['Kitchen access', 'Warming equipment'],
    instantBook: false,
    featured: true
  },
  {
    id: 'p26',
    vendorId: 'v15',
    name: 'Farm to Table Dinner',
    description: 'Multi-course plated dinner featuring Georgia farms.',
    type: 'DAILY',
    price: 2200,
    minUnits: 1,
    includes: ['5-Course Dinner', 'Wine Pairings', 'Full Staff', 'All Rentals', 'Linens', 'Cleanup'],
    addOns: [
      { id: 'a51', name: 'Cheese Course', price: 200 },
      { id: 'a52', name: 'Dessert Trio', price: 175 }
    ],
    requirements: ['Full kitchen access', 'Minimum 20 guests'],
    instantBook: false,
    featured: true
  },
  // ATL Photo Studio Packages
  {
    id: 'p27',
    vendorId: 'v16',
    name: 'Event Coverage',
    description: 'Professional event photography for any occasion.',
    type: 'HOURLY',
    price: 275,
    minUnits: 3,
    includes: ['Photographer', '200+ Photos', 'Online Gallery', 'Print Rights', '48hr Delivery'],
    addOns: [
      { id: 'a53', name: 'Instant Prints', price: 200 },
      { id: 'a54', name: 'Photo Booth', price: 400 }
    ],
    requirements: ['Parking for photographer'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p28',
    vendorId: 'v16',
    name: 'Wedding Photo + Video',
    description: 'Complete wedding documentation with photo and film.',
    type: 'HOURLY',
    price: 650,
    minUnits: 8,
    includes: ['Lead Photographer', 'Videographer', '600+ Photos', 'Highlight Film', 'Full Ceremony Film', 'Online Gallery'],
    addOns: [
      { id: 'a55', name: 'Drone Coverage', price: 400 },
      { id: 'a56', name: 'Same-Day Edit', price: 800 }
    ],
    requirements: ['Vendor meals', 'Timeline coordination'],
    instantBook: false,
    featured: true
  },
  // Southern Charm Events Packages
  {
    id: 'p29',
    vendorId: 'v17',
    name: 'Garden Party Setup',
    description: 'Elegant outdoor setup with florals for intimate gatherings.',
    type: 'DAILY',
    price: 1200,
    minUnits: 1,
    includes: ['Vintage Furniture Set', '4 Centerpieces', 'Arch Florals', 'Lanterns', 'Setup & Strike'],
    addOns: [
      { id: 'a57', name: 'Pergola Rental', price: 400 },
      { id: 'a58', name: 'Ceremony Florals', price: 600 }
    ],
    requirements: ['Outdoor venue', 'Vehicle access'],
    instantBook: false,
    featured: true
  },
  // Windy City DJs Packages
  {
    id: 'p30',
    vendorId: 'v18',
    name: 'Chicago Classic',
    description: 'Premium DJ services for weddings and events.',
    type: 'HOURLY',
    price: 300,
    minUnits: 4,
    includes: ['Professional DJ', 'Premium Sound', 'Wireless Mics (2)', 'Dance Floor Lighting', 'MC Services'],
    addOns: [
      { id: 'a59', name: 'Ceremony Sound', price: 200 },
      { id: 'a60', name: 'Photo Booth', price: 500 }
    ],
    requirements: ['Power outlet', 'Indoor venue'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p31',
    vendorId: 'v18',
    name: 'Rooftop Experience',
    description: 'Full production for Chicago rooftop events.',
    type: 'HOURLY',
    price: 600,
    minUnits: 5,
    includes: ['Top DJ', 'Outdoor Sound System', 'LED Lighting', 'Fog Machine', 'MC Services', 'Backup Equipment'],
    addOns: [
      { id: 'a61', name: 'Saxophone', price: 500 },
      { id: 'a62', name: 'Percussion', price: 400 }
    ],
    requirements: ['Rooftop access', 'Weather contingency plan'],
    instantBook: false,
    featured: true
  },
  // Chicago Gourmet Catering Packages
  {
    id: 'p32',
    vendorId: 'v19',
    name: 'Executive Lunch',
    description: 'Refined lunch service for corporate meetings.',
    type: 'HOURLY',
    price: 350,
    minUnits: 2,
    includes: ['3-Course Lunch', 'Coffee & Tea Service', 'Staff', 'All Rentals', 'Cleanup'],
    addOns: [
      { id: 'a63', name: 'Wine Service', price: 200 },
      { id: 'a64', name: 'Dessert Display', price: 150 }
    ],
    requirements: ['Kitchen or warming area'],
    instantBook: false,
    featured: true
  },
  {
    id: 'p33',
    vendorId: 'v19',
    name: 'Gala Dinner',
    description: 'Black-tie worthy plated dinner service.',
    type: 'DAILY',
    price: 4500,
    minUnits: 1,
    includes: ['6-Course Dinner', 'Premium Wine Pairings', 'Full Service Staff', 'Specialty Linens', 'All Rentals'],
    addOns: [
      { id: 'a65', name: 'Raw Bar', price: 800 },
      { id: 'a66', name: 'Tableside Preparation', price: 600 }
    ],
    requirements: ['Commercial kitchen', 'Minimum 50 guests'],
    instantBook: false,
    featured: true
  },
  // Lakefront Photo & Film Packages
  {
    id: 'p34',
    vendorId: 'v20',
    name: 'Portrait Session',
    description: 'Professional portrait photography along the lakefront.',
    type: 'HOURLY',
    price: 300,
    minUnits: 1,
    includes: ['1-Hour Session', '30+ Edited Photos', 'Online Gallery', 'Print Release'],
    addOns: [
      { id: 'a67', name: 'Outfit Change', price: 75 },
      { id: 'a68', name: 'Rush Delivery', price: 100 }
    ],
    requirements: ['Outdoor location'],
    instantBook: true,
    featured: true
  },
  {
    id: 'p35',
    vendorId: 'v20',
    name: 'Wedding Documentary',
    description: 'Full wedding coverage with cinematic film.',
    type: 'HOURLY',
    price: 575,
    minUnits: 10,
    includes: ['2 Photographers', 'Videographer', '800+ Photos', 'Feature Film', 'Highlight Reel', 'Raw Footage'],
    addOns: [
      { id: 'a69', name: 'Engagement Session', price: 400 },
      { id: 'a70', name: 'Album Design', price: 600 }
    ],
    requirements: ['Timeline meeting', 'Vendor meals'],
    instantBook: false,
    featured: true
  },
  // Magnificent Mile Florals Packages
  {
    id: 'p36',
    vendorId: 'v21',
    name: 'Luxury Bridal Collection',
    description: 'Exquisite bridal party flowers with premium blooms.',
    type: 'DAILY',
    price: 1500,
    minUnits: 1,
    includes: ['Bridal Bouquet (Premium)', '6 Bridesmaid Bouquets', '8 Boutonnieres', '4 Corsages', 'Consultation'],
    addOns: [
      { id: 'a71', name: 'Flower Crown', price: 200 },
      { id: 'a72', name: 'Petal Aisle', price: 400 }
    ],
    requirements: ['3-week advance booking'],
    instantBook: false,
    featured: true
  },
  {
    id: 'p37',
    vendorId: 'v21',
    name: 'Grand Celebration',
    description: 'Complete floral design for luxury weddings and galas.',
    type: 'DAILY',
    price: 8500,
    minUnits: 1,
    includes: ['All Personal Flowers', 'Ceremony Installation', '25 Centerpieces', 'Sweetheart Table', 'Cocktail Florals', 'Full Installation'],
    addOns: [
      { id: 'a73', name: 'Suspended Installation', price: 3000 },
      { id: 'a74', name: 'Floral Wall', price: 2500 }
    ],
    requirements: ['Design consultation', '6-week advance booking'],
    instantBook: false,
    featured: true
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
