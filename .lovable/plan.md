
# Fix Logo Visibility on Landing Page

## Problem
The logo on the Sentence Landing page is:
- Too small: `h-8` (32px height)
- Too faint: `opacity-70` makes it nearly invisible against the cinematic slideshow
- Awkward placement: Absolute bottom center fights with the content hierarchy

## Solution: Prominent Top-Left Brand Anchor

Move the logo to the **top-left corner** with a glassmorphism backing, similar to how premium apps show branding on immersive landing pages. This establishes brand presence without competing with the central sentence.

### Visual Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ┌─────────────────┐                                               │
│   │ [○] Event Pro   │  ← Top-left, glass backing, prominent         │
│   └─────────────────┘                                               │
│                                                                      │
│      "I am planning a [ Wedding ] in [ Austin ] on [ Mar 15 ]."     │
│                                                                      │
│                       [ Reveal Matches → ]                           │
│                                                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Implementation Details

**File to modify:** `src/pages/SentenceLanding.tsx`

**Changes:**

1. **Move logo from bottom to top-left corner**
   - Position: `absolute top-6 left-6` (or `top-8 left-8` for more padding)
   - This mirrors where users expect branding (top-left is universal)

2. **Increase logo size**
   - Change from `h-8` (32px) to `h-12` or `h-14` (48-56px)
   - Large enough to be legible but not overwhelming

3. **Add glass backing for visibility**
   - Wrap in a container with `bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-3`
   - This ensures the logo is visible regardless of what slideshow image is showing

4. **Remove reduced opacity**
   - Change from `opacity-70 hover:opacity-100` to full `opacity-100`
   - The glass backing provides enough contrast

5. **Add the wordmark text (optional)**
   - Similar to Header: Logo icon + "Event Pro" text beside it
   - Creates stronger brand recognition

### Code Structure

```text
{/* Logo - Top Left with Glass Backing */}
<motion.div 
  className="absolute top-6 left-6 z-20"
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg">
    <img 
      src={logo} 
      alt="Event Pro" 
      className="h-10 w-auto"
    />
    <div className="flex flex-col leading-none">
      <span className="font-display font-bold text-foreground text-lg">
        Event Pro
      </span>
      <span className="text-muted-foreground text-xs">
        by Vendibook
      </span>
    </div>
  </div>
</motion.div>
```

### Animation
- Fade in from left with subtle slide (`x: -20 → 0`)
- Slight delay (`0.2s`) so it appears after the background settles
- Natural spring physics for polish

### Mobile Considerations
- On mobile: Same top-left position
- Slightly smaller sizing: `h-8` with reduced padding
- Glass backing remains for visibility

### Alternative Option: Larger Centered Bottom
If you prefer keeping the logo at the bottom:
- Increase to `h-14` (56px)
- Add glass pill backing: `bg-white/80 backdrop-blur-xl rounded-full px-6 py-3`
- Move up slightly: `bottom-12` instead of `bottom-8`

---

## Summary

| Property | Current | Proposed |
|----------|---------|----------|
| Position | Bottom center | Top-left |
| Size | `h-8` (32px) | `h-10` to `h-12` (40-48px) |
| Opacity | 70% | 100% |
| Background | None | Glass morphism (`bg-white/80 backdrop-blur-xl`) |
| Wordmark | No | Yes (Event Pro + by Vendibook) |
| Animation | Fade in | Slide from left + fade |
