## Goal

Extend the Browse → URL write-back so a refresh restores the **full** search state, not just text/location/date. Today only `q`, `location`, `category`, `date`, `start`, `end`, `lat`, `lng`, `city`, `state` round-trip through the URL.

## Filters to add to URL round-trip

From the existing `BrowseFilters` shape in `useBrowsePackages.ts`, plus `sortBy`:

| URL param | Filter field | Notes |
|---|---|---|
| `radius` | `searchRadius` | omit when default `25` |
| `minRating` | `minRating` | numeric (e.g. `4.5`) |
| `minPrice` | `minPrice` | numeric |
| `maxPrice` | `maxPrice` | numeric |
| `instantBook` | `instantBook` | `1` when true |
| `verified` | `verified` | `1` when true |
| `onlinePay` | `onlinePaymentsOnly` | `1` when true |
| `sort` | `sortBy` | omit when `recommended` |

### Filters the user mentioned that don't exist yet

- **Response time** — no `responseTime` filter currently exists in `BrowseFilters`. Not in scope for URL persistence until the filter itself ships. Flagged for a follow-up.
- **Hourly / daily toggle** — no `pricingType` filter exists; `type` is a per-package field but there's no UI toggle wired into filters. Flagged for a follow-up.

If you want those two added now, say so and I'll include both the filter state + UI control + URL persistence in the same pass.

## Implementation

**File:** `src/pages/Browse.tsx`

1. **Read effect (initial hydration)** — extend the mount-time `useEffect` (currently lines ~82–115) to also parse `radius`, `minRating`, `minPrice`, `maxPrice`, `instantBook`, `verified`, `onlinePay`, `sort` from `searchParams` and call `updateFilter` / `setSortBy` for each present value. Validate numeric params with `parseFloat` + `Number.isFinite` before applying. Validate `sort` against the allowed `SortOption` union.

2. **Write effect (filters → URL)** — extend the sync `useEffect` (currently lines ~119–157) with a small helper that sets boolean params as `'1'` (or deletes when false) and numeric params as their string form (or deletes when null/default). Add `searchRadius`, `minRating`, `minPrice`, `maxPrice`, `instantBook`, `verified`, `onlinePaymentsOnly`, and `sortBy` to the dependency array.

3. **Default elision** — to keep URLs clean:
   - `radius` only written when `searchRadius !== 25`
   - `sort` only written when `sortBy !== 'recommended'`
   - booleans only written when `true`
   - numerics only written when not `null`

4. **Outbound search modules** — `StickyMiniSearch.tsx` already forwards `instantBook`, `verified`, and `minRating` (as `instantBook=1`, `verified=1`, `minRating=4.5`). Align param names so Browse reads what the mini-search writes (it already uses the same names; no change needed there). No edits required to `SearchModal`/`HeroSection` for this task — they don't set these filters at entry time.

## Acceptance

- Toggle Instant Book → URL shows `instantBook=1`. Refresh → still on. Untoggle → param removed.
- Adjust radius slider to 50 → URL shows `radius=50`. Refresh → slider at 50, results unchanged. Reset to 25 → param removed.
- Set Min Rating 4.5, Min Price 100, Max Price 500 → all three params persist and restore on refresh.
- Change Sort to `nearest` → `sort=nearest` in URL; refresh keeps sort. Switch back to Recommended → param removed.
- Combined state (location + coords + category + radius + rating + price + sort) all restore together after refresh.

## Out of scope

- Adding a Response Time filter (no current state field).
- Adding an Hourly / Daily pricing toggle (no current state field).
- Changing how filters are applied (no logic changes in `useBrowsePackages.ts`).