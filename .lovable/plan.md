
# UI Consistency and Auth Flow Improvements

## Overview
This plan addresses three related improvements to create consistency across the platform:
1. Auto-switch to sign-up mode when `?signup=true` is in the Auth page URL
2. Add user avatar and dropdown menu to the main Header for logged-in users
3. Align the logo vertically with the navigation elements in the SentenceLanding page

---

## Changes

### 1. Auth Page - Handle `?signup=true` Parameter

**File:** `src/pages/Auth.tsx`

Add URL parameter detection to automatically switch to sign-up mode when users arrive from the "Create Profile" button.

**What will be added:**
- Import `useSearchParams` from `react-router-dom`
- Read the `signup` parameter on component mount
- If `signup=true`, set `isSignUp` state to `true`

This ensures a smooth user experience when clicking "Create Profile" from any page.

---

### 2. Header - Add User Avatar and Dropdown Menu

**File:** `src/components/layout/Header.tsx`

Replace the simple chat support icon for logged-in users with an avatar dropdown menu matching the SentenceLanding page design.

**What will be added:**
- Import Avatar, DropdownMenu components, and additional icons (User, LogOut, LayoutDashboard)
- Import `signOut` from `useAuth` hook
- Add state for `userInitial` and fetch user profile data
- Replace the MessageCircle button with:
  - Avatar showing user initial
  - Dropdown menu with user email, Dashboard link, and Sign Out option
- Keep the chat support icon inside the dropdown or hamburger menu

---

### 3. SentenceLanding - Align Logo with Top Right Buttons

**File:** `src/pages/SentenceLanding.tsx`

Adjust the vertical positioning of the logo to align evenly with the Sign In and Create Profile buttons.

**What will be changed:**
- Update the logo container's `top` positioning to use `items-center` alignment
- Adjust the `top-6 md:top-8` values to match button vertical center
- Ensure both the logo and buttons share the same vertical baseline

---

## Technical Details

### Auth.tsx Changes
```text
- Add: import { useSearchParams } from 'react-router-dom'
- Add useEffect to check for ?signup=true and set isSignUp(true)
```

### Header.tsx Changes
```text
- Add imports: Avatar, AvatarFallback, DropdownMenu components, User, LogOut, LayoutDashboard icons
- Add signOut to useAuth destructuring
- Add userInitial state and profile fetch useEffect
- Replace logged-in user section with avatar + dropdown matching SentenceLanding
```

### SentenceLanding.tsx Changes
```text
- Adjust logo and button containers to share consistent vertical alignment
- Use matching top offset values for both elements
```

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/pages/Auth.tsx` | Add URL parameter handling for signup mode |
| `src/components/layout/Header.tsx` | Add avatar dropdown for logged-in users |
| `src/pages/SentenceLanding.tsx` | Align logo with navigation buttons |

---

## Expected Outcome

- Clicking "Create Profile" anywhere will land on Auth page in sign-up mode
- Logged-in users see their avatar in the Header with Dashboard and Sign Out options
- The SentenceLanding page logo and buttons are vertically aligned for a polished look
