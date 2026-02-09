export function isEmbeddedInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // If cross-origin access throws, we are definitely embedded.
    return true;
  }
}

type ExternalNavMode = 'same_tab' | 'new_tab';

export type PreparedExternalNavigation = {
  mode: ExternalNavMode;
  popupBlocked: boolean;
  open: (url: string) => void;
  cancel: () => void;
};

/**
 * Prepare navigation to an external URL.
 *
 * Why: in Lovable preview the app runs inside an iframe, and many third-party pages (Stripe)
 * cannot be rendered in an iframe, producing a "forbidden" / sad-face page.
 *
 * This helper:
 * - Detects iframe embedding
 * - Pre-opens a blank tab synchronously (so pop-up blockers are less likely to block it)
 * - Later you call `open(url)` once you have the external URL
 */
export function prepareExternalNavigation(options?: { forceNewTab?: boolean }): PreparedExternalNavigation {
  const forceNewTab = options?.forceNewTab ?? false;
  const useNewTab = forceNewTab || isEmbeddedInIframe();

  let popup: Window | null = null;
  if (useNewTab) {
    popup = window.open('', '_blank', 'noopener,noreferrer');
  }

  const open = (url: string) => {
    if (useNewTab) {
      if (popup) {
        popup.location.href = url;
        return;
      }

      // Fallback attempt (may still be blocked)
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.location.href = url;
  };

  const cancel = () => {
    try {
      popup?.close();
    } catch {
      // ignore
    }
  };

  return {
    mode: useNewTab ? 'new_tab' : 'same_tab',
    popupBlocked: useNewTab && !popup,
    open,
    cancel,
  };
}
