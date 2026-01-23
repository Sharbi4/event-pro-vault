
# Demo Data Enhancement for Investor Showcase

## Overview
Adding realistic mock data throughout the app to create a "live" demo experience for investors and early adopters. The focus is on making the sentence builder landing page flow → results page feel authentic with 2026 dates, real US cities, and varied event types.

---

## Strategy

The app currently pulls data from the Supabase database (6 packages, 1 vendor in Los Angeles). To create a realistic demo without adding fake database records, I'll seed additional demo vendor profiles and packages directly into the database with:

- **8-10 demo vendors** across major US metros
- **20-25 packages** covering different service categories  
- **Realistic 2026 availability** with package-level weekly schedules
- **Demo reviews** for social proof

---

## Data to Add

### Demo Cities (Targeting Major Event Markets)
| City | State | Why |
|------|-------|-----|
| Los Angeles | CA | Entertainment/wedding hub |
| Miami | FL | Beach weddings, corporate retreats |
| Austin | TX | Tech events, festivals |
| New York | NY | Corporate, luxury weddings |
| Chicago | IL | Midwest corporate hub |
| Atlanta | GA | Southern weddings, conferences |
| Denver | CO | Outdoor events, wellness |
| Nashville | TN | Music, country weddings |

### Demo Vendors (10 total)
1. **Blaze & Grill Co.** (Los Angeles) - Food Trucks, BBQ
2. **DJ Quantum** (Miami) - DJs, Club & Wedding
3. **Mixology Masters** (New York) - Mobile Bartending
4. **Chef Isabella** (San Francisco) - Private Chef
5. **The Magic of Marco** (Las Vegas) - Performers
6. **Party Perfect Rentals** (Austin) - Event Rentals
7. **Zen Vibes Wellness** (Denver) - Wellness
8. **Peach State Catering** (Atlanta) - Catering
9. **Windy City DJs** (Chicago) - DJs
10. **Nashville Harmonics** (Nashville) - Live Music

### Demo Packages (25 total, varied pricing)
- **Food/Catering**: BBQ Feast ($450), Taco Truck ($300), Private Chef Dinner ($1,200)
- **DJs/Music**: Club DJ ($275/hr), Wedding DJ ($350/hr), Live Band ($800/hr)
- **Bartending**: Cocktail Hour ($200/hr), Full Bar Service ($350/hr)
- **Photography**: Wedding Coverage ($500/hr), Event Photos ($300/hr)
- **Rentals**: Table/Chair Package ($150), Tent Setup ($500)
- **Wellness**: Corporate Yoga ($250), Sound Healing ($400)
- **Performers**: Magician ($500), Fire Dancer ($650)

### Demo Availability (2026 Focus)
Each package will have:
- Weekly availability (Mon-Sun with realistic hours)
- Open dates throughout **Spring/Summer 2026** (March - August)
- A few blocked dates to show realism (holidays, already-booked weekends)

### Demo Reviews (3-5 per popular vendor)
Sample reviews with realistic names, ratings (4.5-5.0 range), and short testimonials.

---

## Database Changes Required

### 1. Insert Demo Profiles (vendors)
```sql
INSERT INTO profiles (user_id, full_name, email, is_vendor, avatar_url, stripe_account_status, identity_verification_status)
VALUES 
  (gen_random_uuid(), 'Blaze & Grill Co.', 'demo+blazegrill@example.com', true, 'https://...', 'active', 'verified'),
  -- 9 more vendors...
```

### 2. Insert Demo Vendor Details
```sql
INSERT INTO vendor_details (user_id, business_name, city, state, formatted_address, service_area)
VALUES 
  ('uuid-1', 'Blaze & Grill Co.', 'Los Angeles', 'CA', '123 Main St, Los Angeles, CA 90001', 'Los Angeles'),
  -- 9 more...
```

### 3. Insert Demo Packages
```sql
INSERT INTO vendor_packages (user_id, name, category, type, price, description, includes, images, instant_book, is_active)
VALUES 
  ('uuid-1', 'Smokehouse Feast', 'food-trucks', 'HOURLY', 450, 'Award-winning BBQ...', ARRAY['Brisket','Ribs','Sides'], ARRAY['url1','url2'], true, true),
  -- 24 more...
```

### 4. Insert Package Weekly Availability
```sql
INSERT INTO package_weekly_availability (package_id, day_of_week, is_enabled, start_time, end_time)
VALUES 
  ('pkg-uuid-1', 0, true, '10:00', '22:00'), -- Sunday
  ('pkg-uuid-1', 1, true, '09:00', '21:00'), -- Monday
  -- For each package...
```

### 5. Insert Demo Reviews
```sql
INSERT INTO reviews (vendor_user_id, package_id, rating, text, reviewer_name, created_at)
VALUES 
  ('uuid-1', 'pkg-uuid-1', 5, 'Amazing BBQ! Everyone loved it.', 'Sarah M.', '2025-11-15'),
  -- More reviews...
```

---

## Technical Notes

### Data Isolation
- All demo vendors use `demo+*@example.com` emails for easy identification
- Can be filtered out or deleted post-demo if needed

### Image Sources
Using professional Unsplash images already referenced in the static `vendors.ts` file:
- Food: `https://images.unsplash.com/photo-1529193591184-b1d58069ecdd`
- DJ: `https://images.unsplash.com/photo-1571266028243-d220c6d6c0db`
- Bartending: `https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b`

### Realistic Touches
- Pricing aligned with industry standards
- Response times vary (< 1 hour to < 4 hours)
- Mix of instant book and request-only packages
- Some vendors verified, some pending (shows progression)

---

## Files to Modify

| File | Changes |
|------|---------|
| Database (migration) | Insert demo profiles, vendor_details, packages, availability, reviews |

**No frontend code changes needed** - the existing `useBrowsePackages` hook will automatically pull this demo data from the database.

---

## Demo Scenarios Enabled

After seeding this data, demos will work smoothly for:

1. **"Wedding in Los Angeles on June 15, 2026"** → Shows photographers, DJs, caterers, florists
2. **"Corporate Event in Austin on April 10, 2026"** → Shows rentals, catering, bartending
3. **"Birthday Party in Miami on July 4, 2026"** → Shows DJs, food trucks, performers
4. **"Private Party in Denver on May 22, 2026"** → Shows wellness, rentals, private chefs

---

## Scope Summary
- **10 demo vendors** across 8 cities
- **25 demo packages** across 8 categories
- **Weekly availability** for all packages (2026 dates open)
- **15-20 demo reviews** for social proof
- All data inserted via database migration
- Zero frontend code changes required
