"use client";

import Script from "next/script";

export function GoogleTracking() {
  // Google Ads Conversion Tracking ID
  const trackingId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17970110756";

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
        strategy="afterInteractive"
        async
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `}
      </Script>
    </>
  );
}
