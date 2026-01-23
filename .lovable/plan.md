
# Remove Market Spots and Market Bookings from Dashboard

## Overview
Clean up the Dashboard page by removing all market-related UI elements and logic, aligning with the scope narrowing decision to focus exclusively on Event Services.

---

## Changes Required

### File: `src/pages/Dashboard.tsx`

| Section | What to Remove |
|---------|----------------|
| **Imports** | `useSlotBookings` hook, `SlotBookingsSection` component, `Store` icon |
| **Hook calls** | `const { bookings: slotBookings, loading: slotBookingsLoading, cancelBooking } = useSlotBookings();` |
| **Stats grid** | Remove "Market Spots" card showing `slotBookings.length` |
| **Tabs** | Remove "Markets" `TabsTrigger` with Store icon |
| **Tab content** | Remove `TabsContent value="markets"` with `SlotBookingsSection` |
| **Admin badge** | Update badge count to only show `pendingEventPros.length` (remove `pendingMarkets`) |

---

## Before/After Stats Row

**Before (4 columns):**
```text
[ Bookings ] [ Market Spots ] [ Favorites ] [ Confirmed ]
```

**After (3 columns):**
```text
[ Bookings ] [ Favorites ] [ Confirmed ]
```

---

## Before/After Tabs

**Before:**
```text
[ Bookings ] [ Markets ] [ Favorites ] [ Profile ] [ Admin? ]
```

**After:**
```text
[ Bookings ] [ Favorites ] [ Profile ] [ Admin? ]
```

---

## Technical Details

### Removed Imports
```tsx
// DELETE these:
import { useSlotBookings } from '@/hooks/useSlotBookings';
import { SlotBookingsSection } from '@/components/dashboard/SlotBookingsSection';
// Remove Store from icon imports
```

### Removed Hook Call
```tsx
// DELETE this line:
const { bookings: slotBookings, loading: slotBookingsLoading, cancelBooking } = useSlotBookings();
```

### Updated Stats Grid
Change from `grid-cols-4` to `grid-cols-3` and remove the Market Spots card.

### Admin Badge Fix
Change from:
```tsx
{(pendingEventPros.length + pendingMarkets.length) > 0 && (
  <Badge>
    {pendingEventPros.length + pendingMarkets.length}
  </Badge>
)}
```
To:
```tsx
{pendingEventPros.length > 0 && (
  <Badge>
    {pendingEventPros.length}
  </Badge>
)}
```

---

## Summary
- Remove 1 import (SlotBookingsSection component)
- Remove 1 hook (useSlotBookings) 
- Remove 1 icon import (Store)
- Remove 1 stats card (Market Spots)
- Remove 1 tab (Markets)
- Remove 1 tab content section
- Update admin badge to only count Event Pro submissions
- Change stats grid from 4 to 3 columns
