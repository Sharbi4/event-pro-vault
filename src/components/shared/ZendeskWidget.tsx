import { useEffect } from 'react';

declare global {
  interface Window {
    zE?: (...args: unknown[]) => void;
  }
}

const ZENDESK_KEY = '82e7546d-7577-442e-8df3-8a03ac801f21';

export function ZendeskWidget() {
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('ze-snippet')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${ZENDESK_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount (optional - usually you want the widget to persist)
      const existingScript = document.getElementById('ze-snippet');
      if (existingScript) {
        existingScript.remove();
      }
      // Remove the Zendesk iframe if it exists
      const zendeskFrame = document.getElementById('launcher');
      if (zendeskFrame) {
        zendeskFrame.remove();
      }
    };
  }, []);

  return null;
}

// Helper to programmatically open the chat
export function openZendeskChat() {
  if (window.zE) {
    window.zE('messenger', 'open');
  }
}

// Helper to programmatically close the chat
export function closeZendeskChat() {
  if (window.zE) {
    window.zE('messenger', 'close');
  }
}
