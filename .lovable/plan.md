## Goal

Two upgrades to make the marketplace feel premium and food-driven:

1. Make the search-result vendor card highly visual (food photo, logo overlay, package previews with thumbnails, availability badge).
2. Replace the generic `HowItWorks` page with a premium pathway page titled **"Book or get booked, your way."** that serves both customers and Event Pros.

---

## Part 1 — Vendor Search Listing Card

**File:** `src/components/browse/BrowseVendorCard.tsx` (rewrite, no API changes needed — `BrowsePackage.images[]` and `vendor_avatar` already available).

New card structure (desktop + mobile):

```text
┌──────────────────────────────────────────┐
│   [LARGE FOOD/HERO IMAGE  4:3]           │
│   ┌────┐                       [Verified]│
│   │logo│ ← avatar overlay      [Instant] │
│   └────┘                                 │
│                                          │
│   Tia's Taco Truck       ⭐ 4.9 (82)     │
│   Food Truck · Tacos · Phoenix           │
│                                          │
│   🟢 Available Sat, May 16 at 5:00 PM    │
│                                          │
│   ┌──┐ Taco Truck Pull-Up   from $250    │
│   │🌮│ 3 hrs                              │
│   ├──┤ Private Catering    from $18/pp   │
│   │🌮│ 50 guests                          │
│   └──┘                                   │
│                                          │
│   Pull-Up · Catering · Insured           │
│   [ View availability → ]                │
└──────────────────────────────────────────┘
```

Specifics:
- Hero image = first available `images[0]` across the vendor's top packages; fallback = vendor avatar centered on a soft gradient with the category icon.
- Logo overlay = circular avatar (56px) bottom-left of hero with white ring + soft shadow.
- Trust pills (Verified / Instant) overlay top-right of hero.
- Availability badge: green pill when date+time matched ("Available {EEE, MMM d} at {h:mm a}"), neutral pill when only date searched ("Available {EEE, MMM d}"), hidden when no search context.
- Package preview rows: small 48px square thumbnail (package `images[0]` or food emoji per category), name (truncate), secondary line (duration/guests when present), right-aligned `from $X`. Show 3 on desktop, 2 on mobile (`hidden sm:flex` on the third).
- Booking-type badges row: derived from package types (`pullup`, `catering`, `private`) + `Insured` if any package flag set.
- CTA: full-width outline button **"View availability"** → `/vendor/{vendor_user_id}`.
- Whole card uses existing `Card` primitive, `rounded-2xl`, hover lift, Vendibook orange accent on CTA hover.

No DB/schema changes. No new hook calls.

---

## Part 2 — "Book or get booked" pathway page

**File:** `src/pages/HowItWorks.tsx` (full rewrite). Nav label stays **"How it works"**; route stays `/how-it-works`.

Sections:

1. **Hero** — Headline "Book or get booked, your way." + subhead from spec. CTAs: `Find vendors` → `/browse`, `Become an Event Pro` → `/become-a-pro`.
2. **Choose your path** — 2 large cards: "I'm planning an event" → `/browse`; "I'm an Event Pro" → `/become-a-pro`.
3. **Three ways to bring food to your event** — 3 cards:
   - Pull-Up Booking → `/browse?type=pullup`
   - Catering Packages → `/browse?type=catering`
   - Private Packages → `/browse?type=private` (copy clarifies message-based custom flow; no "Quote Request" wording)
   - Each card: title, copy, "Best for" bullets, "Payment style" bullets, CTA.
4. **From search to served** — 5-step horizontal/vertical timeline (Search → Compare → Book/Message → Track → Enjoy).
5. **Turn your open calendar into bookings** — 6-step Event Pro journey + CTA "Become an Event Pro".
6. **Built for real event bookings** — 6 compact trust cards (Availability search, Package booking, Private packages, Reminders, Cancellation rules, Reviews).
7. **Where do you want to go?** — Two link columns:
   - Customer: Search vendors, Food trucks, Mobile bartenders, Dessert vendors, Catering packages, Available this weekend (link to `/browse` with appropriate `?category=` / `?date=` query params).
   - Event Pro: Become an Event Pro, Create a package (`/vendor-onboarding`), Set availability (`/vendor-dashboard?tab=availability`), Private packages (`/how-it-works#private`), Vendor dashboard (`/vendor-dashboard`).
   - Disabled state styling for any route that doesn't exist yet.

Design: clean white/neutral background, rounded cards, soft shadows, Vendibook orange CTA accent, mobile-first stacked layout, no walls of copy.

---

## Technical notes

- No backend, schema, or hook changes.
- Reuses existing `BrowsePackage.images`, `vendor_avatar`, package `type` for booking-type derivation.
- Adds a small helper `getCategoryEmoji(category)` inside `BrowseVendorCard.tsx` for image fallback (taco/cocktail/cake/etc.).
- Keeps the existing `Layout`, `Card`, `Button`, `Badge` primitives — no new dependencies.

---

## Acceptance criteria

- Search results show food-forward cards with hero image + logo overlay + 2–3 package previews with thumbnails + availability badge + "View availability" CTA.
- Mobile shows 2 package previews; desktop shows 3.
- `/how-it-works` renders the new pathway page with all 7 sections, both audience CTAs working, and all internal links routed (or visibly disabled).
