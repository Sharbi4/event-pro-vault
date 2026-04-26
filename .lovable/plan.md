## Goal

Redesign the EventPro homepage to feel like a premium, modern, app-style marketplace for booking mobile food & beverage vendors — Apple-simple, Airbnb-clear, StyleSeat-bookable, and visually craveable. Add an AI concierge that helps users figure out what to book, and a Flexible Dates section so they never hit a dead end.

## Scope

Replace the current homepage composition (`src/pages/Index.tsx`) and rework `HeroSection`. Add new sections. Keep existing data hooks where possible. No DB schema changes for v1 (AI assistant is stateless).

## New homepage structure

1. **Hero + premium search module** (rewrite `HeroSection`)
   - Large food-forward background imagery (warm, editorial)
   - Headline: "Book food trucks, mobile bars, and dessert vendors for your next event."
   - Subheadline as written in the brief
   - Search card with: Date, Location, Vendor Type, Cuisine, Guest Count
   - Primary CTA: "Search vendors"
   - Secondary CTA: "Let AI help me choose" → opens AI Assistant drawer
2. **Category + cuisine chips** under search (horizontal scroll on mobile) — vendor categories + cuisines as listed
3. **AI Concierge strip** ("EventPro Assistant") with prompt chips ("Apartment event for 100", "Office lunch for 40", etc.)
4. **Featured / Available this weekend** vendor cards (reuse `FeaturedPackages` data; restyle card with badges: Verified, Pull-Up, Catering, Private Package)
5. **Flexible Dates** section: cards for "This weekend", "Tomorrow", "Friday night", "Sunday brunch", "Next available", "Within 3 days" — each routes into `/browse` with the right date filter
6. **Browse by Occasion**: Apartment event, Office lunch, Birthday, Wedding, Graduation, Market/pop-up, School, Corporate, Neighborhood
7. **Booking type education** — three cards: Pull-Up, Catering, Private Package (Private Package replaces any Quote Request copy)
8. **Trust + ratings** compact row
9. **Event Pro CTA** (reuse, refresh copy)
10. **Final CTA** — "Find the right vendor for your next event."

Sections to remove from current homepage: `CategoryRows`, `HowItWorks`, `Testimonials` (replaced by tighter Trust row).

## New components

- `src/components/home/HeroSection.tsx` — rewritten with hero image, expanded search inputs, AI CTA
- `src/components/home/AIConciergeStrip.tsx` — prompt chips + open assistant drawer
- `src/components/home/AIConciergeDrawer.tsx` — Sheet with chat UI calling new edge function
- `src/components/home/FlexibleDatesSection.tsx` — preset date-flex cards routing to `/browse`
- `src/components/home/OccasionGrid.tsx` — occasion cards routing to `/browse` with cuisine/category preset
- `src/components/home/BookingTypeCards.tsx` — Pull-Up / Catering / Private Package
- `src/components/home/TrustRow.tsx` — compact trust strip
- `src/components/home/FinalCTA.tsx`

Update: `src/pages/Index.tsx` to compose the new sections in the order above.

## AI concierge (edge function)

- `supabase/functions/event-concierge/index.ts` (verify_jwt = false)
- Uses Lovable AI Gateway (`google/gemini-3-flash-preview`)
- System prompt: classifies user intent into `{ category, booking_type, guest_count, cuisine?, suggested_filters }` via tool-calling (structured output) and returns a short friendly message + a "View matches" link → `/browse?...`
- Streamed response rendered in drawer with markdown
- Surface 429 / 402 errors as toasts

## Visual direction

- Crisp white base, generous whitespace, soft rounded cards, subtle shadows
- Vendibook orange CTA accents (existing tokens)
- Large food imagery on hero + occasion cards (use `/src/assets` if existing premium imagery is there; otherwise generate 4–6 hero/occasion images via Nano Banana into `src/assets/home/` during build)
- Mobile-first, horizontally scrollable chip rows

## Out of scope (v1)

- Persisting AI concierge conversations
- New filter fields in `useBrowsePackages` beyond what the search bar already passes (guest count + cuisine will be passed via URL params; backend filtering for those can land in a follow-up if not already supported)

## Acceptance

- Homepage matches the structure above and feels visual + uncluttered
- Search above the fold works for date, location, type, cuisine, guest count
- "Let AI help me choose" opens a working assistant that suggests categories and links into `/browse`
- Flexible Dates and Occasion sections route into `/browse` with correct filters
- No "Quote Request" wording — replaced with "Private Package" everywhere on the homepage