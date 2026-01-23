
# Implementation Plan: Growth Features, Cinematic Hero & Logo Integration

## Overview

This plan implements four key enhancements to the "Art Gallery" redesign:
1. **"Ask Partner" Co-Pilot Feature** - Viral sharing mechanism with Web Share API
2. **High Demand Badge** - Truthful scarcity indicator with pulse animation
3. **Cinematic Video Background** - Immersive hero with blur effects
4. **New Logo Integration** - Updated branding across the app

---

## Feature 1: "Ask Partner" Co-Pilot Button

### Concept
Next to "Secure This Date", add a "Ask Partner" button that generates a beautiful shareable preview card for WhatsApp/iMessage. This creates a viral loop where users share packages with their partners before booking.

### Files to Create
- `src/components/deck/AskPartnerButton.tsx` - The share button component
- `src/components/deck/SharePreviewCard.tsx` - Visual preview card generator

### Files to Modify
- `src/components/deck/GlassInfoPane.tsx` - Add the button below the CTA
- `src/components/deck/DeckCard.tsx` - Pass package data for sharing

### Implementation Details

**AskPartnerButton.tsx:**
```text
- Button with "Ask Partner" or "Send to Partner" label
- Heart icon or users icon for visual cue
- onClick triggers share flow:
  1. Generate a preview image/card with package details
  2. If Web Share API available (navigator.share):
     - Share with title, text, and URL
     - Include package name, price, vendor name
  3. Fallback: Copy link to clipboard with toast notification
```

**Share Content:**
```text
Title: "What do you think about [Package Name]?"
Text: "Check out [Package Name] by [Vendor] - [Price]. Let me know if you like it!"
URL: [Current page URL with package ID]
```

**Visual Style:**
- Glass background (`bg-white/20 backdrop-blur`)
- White text, rounded-full
- Subtle hover animation
- Positioned next to or below the main CTA

---

## Feature 2: High Demand Badge

### Concept
When a vendor is booked 3+ weekends in a row, display a "High Demand" badge with a gentle pulse animation. This creates truthful scarcity without being aggressive.

### Files to Create
- `src/components/badges/HighDemandBadge.tsx` - The badge component

### Files to Modify
- `src/index.css` - Add high-demand pulse animation (separate from instant-badge)
- `src/components/deck/DeckCard.tsx` - Display badge based on booking data
- `src/components/deck/GlassInfoPane.tsx` - Optional inline indicator

### Implementation Details

**HighDemandBadge.tsx:**
```text
Props:
- isHighDemand: boolean (calculated from booking data)
- variant?: 'overlay' | 'inline' (for different placements)

Visual:
- Icon: Flame or TrendingUp
- Text: "High Demand" or "Trending"
- Background: Subtle amber/orange gradient
- Animation: Gentle pulse (not aggressive)
```

**CSS Animation (gentle-pulse):**
```css
@keyframes high-demand-pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.85;
    transform: scale(1.02);
  }
}

.high-demand-badge {
  animation: high-demand-pulse 3s ease-in-out infinite;
  background: linear-gradient(135deg, hsl(35 90% 55%), hsl(25 95% 50%));
  color: white;
}
```

**Logic:**
- For now, mock the high-demand calculation
- Badge appears if `pkg.is_high_demand` is true
- Future: Query actual booking data to calculate demand

---

## Feature 3: Cinematic Video Background

### Concept
Add a full-screen cinematic video background to the Sentence Landing page. The video blurs and dims as users interact with the form fields, creating an immersive "focus" effect.

### Files to Modify
- `src/pages/SentenceLanding.tsx` - Add video background layer
- `src/index.css` - Add video background utilities

### Video Options
1. **Stock Video** - Host a royalty-free wedding/event video
2. **Embedded Video** - Use a service like Cloudinary or Mux
3. **Fallback Image** - High-quality still image with Ken Burns animation

### Implementation Details

**Video Layer Structure:**
```text
<div className="absolute inset-0 z-0 overflow-hidden">
  {/* Video Element */}
  <video 
    autoPlay 
    muted 
    loop 
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/videos/hero-event.mp4" type="video/mp4" />
  </video>
  
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-white/40" />
  
  {/* Dynamic Blur (increases on interaction) */}
  <motion.div 
    className="absolute inset-0 backdrop-blur-sm bg-white/20"
    animate={{ 
      backdropFilter: isComplete ? 'blur(8px)' : 'blur(2px)',
      backgroundColor: isComplete ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)'
    }}
  />
</div>
```

**Interaction Effects:**
- Initially: Subtle blur (2px), light white overlay
- On field focus: Blur increases slightly
- When complete: Stronger blur (8px), focus shifts to content
- Framer Motion handles smooth transitions

**Fallback (No Video):**
- Use a high-quality gradient mesh
- Or Ken Burns effect on a static image
- Graceful degradation for slow connections

---

## Feature 4: New Logo Integration

### Concept
Replace the current `eventpro-logo.png` with the new logo provided by the user. The new logo features:
- Circular icon with inner square element
- Blue accent dot
- "Event Pro" wordmark in clean sans-serif

### Files to Modify
- Copy new logo to `src/assets/eventpro-logo.png` (replace existing)
- `src/components/layout/Header.tsx` - Already uses this asset
- `src/components/layout/Footer.tsx` - Already uses this asset
- `src/pages/SentenceLanding.tsx` - Add logo to minimal footer

### Implementation Details

**Logo Asset:**
- Copy `user-uploads://Gemini_Generated_Image_xta3frxta3frxta3_1-2.png` to `src/assets/eventpro-logo.png`
- This will automatically update Header and Footer

**SentenceLanding.tsx Update:**
```text
Current footer:
<p className="text-sm text-muted-foreground">
  EventPro by Vendibook
</p>

New footer:
<div className="flex items-center justify-center gap-2">
  <img src={logo} alt="Event Pro" className="h-6 w-auto" />
</div>
```

---

## Implementation Order

### Phase 1: Design Foundation Updates
1. Add new CSS animations for high-demand badge
2. Add video background utilities

### Phase 2: Logo Integration
3. Copy new logo to assets folder
4. Update SentenceLanding footer to show logo

### Phase 3: High Demand Badge
5. Create HighDemandBadge component
6. Integrate into DeckCard

### Phase 4: Cinematic Video Background
7. Add video background to SentenceLanding
8. Implement blur effect on interaction

### Phase 5: Ask Partner Co-Pilot
9. Create AskPartnerButton component
10. Integrate into GlassInfoPane
11. Implement Web Share API with fallback

---

## Technical Summary

### New Files
1. `src/components/badges/HighDemandBadge.tsx`
2. `src/components/deck/AskPartnerButton.tsx`

### Modified Files
1. `src/assets/eventpro-logo.png` - Replace with new logo
2. `src/index.css` - Add high-demand animation
3. `src/pages/SentenceLanding.tsx` - Add video background + logo
4. `src/components/deck/DeckCard.tsx` - Add HighDemandBadge
5. `src/components/deck/GlassInfoPane.tsx` - Add AskPartnerButton

### Dependencies
- No new dependencies required
- Uses existing framer-motion for animations
- Uses native Web Share API

### Fallbacks
- Web Share API → Copy to clipboard
- Video background → Gradient mesh or static image
- High Demand → Only shown when data indicates true demand

---

## Visual Summary

**Sentence Landing with Video:**
```text
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ░░░░░░░░░ CINEMATIC VIDEO (blurred) ░░░░░░░░░░░░░░░░░░░░░        │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│                                                                      │
│      "I am planning a [ Wedding ▼ ] in [ Austin ] on [ Mar 15 ]."   │
│                                                                      │
│                       [ Reveal Matches → ]                           │
│                                                                      │
│                          [○ Event Pro]                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Deck Card with High Demand + Ask Partner:**
```text
┌─────────────────────────────────────────────────────────────────────┐
│ [⚡ Instant] [🔥 High Demand]                      [Share]          │
│                                                                     │
│           ░░░░ FULL-SCREEN VENDOR VIDEO ░░░░░░░░░░░░                │
│                                                                     │
│   ┌────────────────────────┐                                        │
│   │ NEXUS EVENTS ✓         │                                        │
│   │ 4-Hour Sunset DJ Set   │                                        │
│   │ ────────────────────── │                                        │
│   │ $1,500 total           │                                        │
│   │                        │                                        │
│   │ [   Secure This Date   ]│                                       │
│   │ [   💕 Ask Partner     ]│  ← NEW                                │
│   │                        │                                        │
│   │ Booked by 14 couples   │                                        │
│   └────────────────────────┘                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
