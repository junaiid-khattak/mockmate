/**
 * Google Ads conversion tracking helpers
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track a signup conversion in Google Ads
 */
export function trackSignupConversion() {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: "AW-17970110756/TQbNCKvNof0bEKTC6PhC",
    });
  }
}

/**
 * Track a custom conversion event in Google Ads
 */
export function trackConversion(conversionLabel: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `AW-17970110756/${conversionLabel}`,
    });
  }
}
