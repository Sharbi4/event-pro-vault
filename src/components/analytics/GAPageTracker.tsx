import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fires a GA4 + Google Ads page_view on every SPA route change.
 * The base gtag.js snippet lives in index.html and loads sitewide.
 */
export function GAPageTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const page_path = location.pathname + location.search;
    const page_location = window.location.origin + page_path;

    window.gtag("event", "page_view", {
      page_path,
      page_location,
      page_title: document.title,
      send_to: "G-LQT0HFQPH9",
    });
    window.gtag("event", "page_view", {
      page_path,
      page_location,
      page_title: document.title,
      send_to: "AW-17121224552",
    });
  }, [location.pathname, location.search]);

  return null;
}
