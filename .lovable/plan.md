
# MVP Full Integration & Cinematic Background Slideshow

## Overview

This plan addresses two critical areas:
1. **Frontend-Backend Integration Gaps** - Wire all the new "Art Gallery" components to the database
2. **Strategic Background Slideshow** - Replace the repetitive video with an immersive image slideshow

---

## Part 1: Critical Integration Fixes

### Issue 1: Search Filters Not Applied

**Problem:** When users complete the sentence "I am planning a Wedding in Austin on March 15" and click "Reveal Matches", the filters are extracted from the URL but never applied to the package query. All packages show regardless of search criteria.

**Files to modify:**
- `src/pages/PackageDeck.tsx`

**Solution:**
- Add a `useEffect` that applies URL search params to the `useBrowsePackages` hook filters
- Call `updateFilter()` for each parameter (location, date, category based on event type)

```text
Current flow:
  SentenceLanding → navigate('/discover?event=Wedding&location=Austin&date=2026-03-15')
  PackageDeck → const { packages } = useBrowsePackages() // Filters ignored!

Fixed flow:
  PackageDeck → useEffect applies URL params to useBrowsePackages filters
  → Query executes with proper filters
```

---

### Issue 2: Booking Drawer Not Creating Bookings

**Problem:** The SpatialDrawer's "Secure This Date" button only logs to console. It doesn't:
- Create a booking record in the database
- Trigger vendor notifications
- Initiate Stripe checkout for deposits

**Files to modify:**
- `src/components/booking/SpatialDrawer.tsx`
- `src/hooks/useBrowsePackages.ts` (to include vendor_user_id)

**Solution:**
1. Import and use the `useBookings` hook
2. Gather all required booking data from the package prop
3. On "Secure This Date" click:
   - For Stripe payments: Create booking → Invoke `create-booking-checkout` → Redirect to Stripe
   - For cash payments: Create booking → Show success state
4. Add authentication check - prompt login if needed

**Required data flow:**
```text
SpatialDrawer receives:
  - package.id
  - package.name
  - package.price
  - package.vendor_user_id (MISSING - needs adding)
  - eventDate (from props)

SpatialDrawer calculates:
  - total_price (based on hours)
  - event_location (needs adding to UI)
  
Calls:
  - createBooking() → creates DB record
  - supabase.functions.invoke('create-booking-checkout') → Stripe session
  - Redirect to checkout URL
```

---

### Issue 3: Missing Vendor User ID in Package Data

**Problem:** `useBrowsePackages` returns packages but doesn't include `vendor_user_id`, which is required for:
- Creating bookings (required field)
- Sending vendor notifications
- Stripe Connect transfers

**Files to modify:**
- `src/hooks/useBrowsePackages.ts`

**Solution:**
Add `vendor_user_id` to the BrowsePackage interface and include it in the enriched package data:

```text
interface BrowsePackage {
  // existing fields...
  vendor_user_id: string;  // ADD THIS
}

// In enrichedPackages mapping:
return {
  // existing fields...
  vendor_user_id: pkg.user_id,  // Already have this data!
}
```

---

### Issue 4: SpatialDrawer Missing Event Location Input

**Problem:** Bookings require an `event_location` field, but the SpatialDrawer has no input for this. Users can't specify where their event is happening.

**Files to modify:**
- `src/components/booking/SpatialDrawer.tsx`

**Solution:**
Add a location input field using the existing `LocationAutocomplete` component:

```text
New UI element:
┌─────────────────────────────────────┐
│   Event Location                    │
│   ┌─────────────────────────────┐   │
│   │ 📍 Enter event address      │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### Issue 5: Authentication Flow for Booking

**Problem:** If a user tries to book without being logged in, there's no handling. The booking will fail silently.

**Files to modify:**
- `src/components/booking/SpatialDrawer.tsx`

**Solution:**
1. Check if user is authenticated before creating booking
2. If not logged in:
   - Store booking intent in localStorage (package ID, date, location, etc.)
   - Redirect to `/auth` page
   - On post-auth, retrieve intent and resume booking flow
3. Alternative: Implement guest checkout flow (already partially supported in useBookings)

---

## Part 2: Strategic Background Slideshow

### Concept

Replace the single looping video with a Ken Burns-style slideshow that:
1. Showcases real package images from the database (teasing the platform's variety)
2. Cross-fades between images with slow zoom animation
3. Dynamically increases blur as users complete the form (existing behavior)

### Implementation

**Files to modify:**
- `src/pages/SentenceLanding.tsx`

**New component to create:**
- `src/components/landing/BackgroundSlideshow.tsx`

**Data source:**
Use package images from the database. Current packages have these images:
- Wedding Photography (floral arch)
- DJ Setup (turntables/lighting)
- Luxury Florals (bouquets)
- Cocktail Bar (bartender mixing)
- Food Trucks (BBQ, gourmet food)

**Slideshow behavior:**
```text
1. Fetch featured package images from vendor_packages table
2. Cycle through images every 6-8 seconds
3. Apply Ken Burns effect (slow zoom 1.0 → 1.15 over duration)
4. Cross-fade between images (1s transition)
5. Overlay blur increases as form completes (existing behavior)
```

**Visual structure:**
```text
┌──────────────────────────────────────────────────────────────────────┐
│   Image 1 (fading out)           Image 2 (fading in)                 │
│   ░░░░░░░░░░░░░░░░░░░░░░         ░░░░░░░░░░░░░░░░░░░░░░░            │
│   ░░ Ken Burns zoom ░░░         ░░ Ken Burns zoom ░░░░░░            │
│   ░░░░░░░░░░░░░░░░░░░░░░         ░░░░░░░░░░░░░░░░░░░░░░░            │
│                                                                      │
│            [ White/blur overlay - increases with form ]              │
│                                                                      │
│      "I am planning a [ Wedding ] in [ Austin ] on [ Mar 15 ]."     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Fallback behavior:**
- If no packages or images available: Show gradient mesh background
- If images fail to load: Use placeholder gradient

---

## Implementation Summary

### Files to Create
1. `src/components/landing/BackgroundSlideshow.tsx` - Image slideshow with Ken Burns

### Files to Modify

1. **`src/pages/PackageDeck.tsx`**
   - Add useEffect to apply URL params to useBrowsePackages filters
   - Pass location/date filters on mount

2. **`src/hooks/useBrowsePackages.ts`**
   - Add `vendor_user_id` to BrowsePackage interface
   - Include it in enriched package return

3. **`src/components/booking/SpatialDrawer.tsx`**
   - Import useBookings hook and useAuth
   - Add event location input field
   - Implement full booking flow:
     - Auth check → Booking creation → Stripe checkout → Success/Error handling
   - Add loading state during booking

4. **`src/pages/SentenceLanding.tsx`**
   - Replace video element with BackgroundSlideshow component
   - Keep dynamic blur behavior

---

## Technical Details

### BackgroundSlideshow Component

```text
Props:
  - images: string[] (fallback images if no packages)
  - interval?: number (default 7000ms)
  - blurIntensity?: number (controlled by parent based on form state)

State:
  - currentIndex: number
  - nextIndex: number
  - isTransitioning: boolean

Effects:
  - Fetch package images on mount
  - Timer to cycle images
  - Framer Motion for Ken Burns animation

Styling:
  - position: absolute, inset: 0
  - overflow: hidden
  - Two image layers for cross-fade
  - CSS: transform: scale() animated from 1.0 to 1.15
```

### Booking Flow Integration

```text
handleSecure():
  1. Validate: eventDate, eventLocation, hours
  2. Check auth: if (!user) → redirect to /auth with intent
  3. Create booking:
     const booking = await createBooking({
       vendor_id: pkg.id,
       vendor_user_id: pkg.vendor_user_id,
       package_id: pkg.id,
       event_date: format(eventDate, 'yyyy-MM-dd'),
       event_location: eventLocation,
       units: hours,
       total_price: totalPrice,
       payment_method: paymentMethod,
       booking_mode: isInstant ? 'INSTANT' : 'REQUEST',
     });
  
  4. If Stripe payment:
     const { url } = await supabase.functions.invoke('create-booking-checkout', {
       body: { booking_id: booking.id }
     });
     window.location.href = url;
  
  5. If cash payment:
     Show success state → Close drawer
```

---

## Success Criteria

After implementation:
1. Users can search by event type, location, and date - results are filtered
2. Clicking "Secure This Date" creates a real booking and initiates payment
3. Vendors receive booking notifications
4. Landing page showcases variety of event services with elegant slideshow
5. Full end-to-end MVP flow works: Declare Intent → Browse Matches → Secure Booking
