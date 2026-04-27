## Goal

Add a "Copy share link" button to the Browse page header that copies the current URL — which already includes lat/lng + every persisted filter via the existing URL write-back — to the clipboard.

## Why this is small

Browse already syncs all filter state (`q`, `location`, `lat`, `lng`, `city`, `state`, `category`, `date`, `start`, `end`, `radius`, `minRating`, `minPrice`, `maxPrice`, `instantBook`, `verified`, `onlinePay`, `sort`) into `searchParams` via the write effect. So the share URL is just `window.location.href`.

## Implementation

**File:** `src/pages/Browse.tsx`

1. Add `Share2` and `Check` to the existing `lucide-react` import. Add `import { toast } from 'sonner'`.

2. Add local state: `const [copied, setCopied] = useState(false)`.

3. Add handler:
   ```tsx
   const handleCopyShareLink = async () => {
     const url = window.location.href;
     try {
       await navigator.clipboard.writeText(url);
     } catch {
       // Fallback for older browsers / insecure contexts
       const ta = document.createElement('textarea');
       ta.value = url;
       ta.style.position = 'fixed';
       ta.style.opacity = '0';
       document.body.appendChild(ta);
       ta.select();
       try { document.execCommand('copy'); } catch {}
       document.body.removeChild(ta);
     }
     setCopied(true);
     toast.success('Share link copied');
     setTimeout(() => setCopied(false), 2000);
   };
   ```

4. Render the button in the existing quick-actions row (next to the Map/Clear buttons, around line 393 in the sticky header):
   ```tsx
   <Button
     variant="outline"
     size="sm"
     onClick={handleCopyShareLink}
     className="h-9 gap-1.5"
     aria-label="Copy share link"
   >
     {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
     <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
   </Button>
   ```

## Acceptance

- Apply filters (location with coords, category, radius, rating, price, sort, etc.) → click Share → clipboard contains the exact current URL with all params.
- Toast confirms "Share link copied"; button briefly shows a check icon and "Copied" label.
- Pasting the URL into a new tab restores the same filter state via the existing read-effect hydration.
- Works on browsers without `navigator.clipboard` via the textarea fallback.