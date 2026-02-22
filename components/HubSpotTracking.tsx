"use client";

import Script from "next/script";

export function HubSpotTracking() {
  // Portal ID: 245139560 (NA2 region)
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || "245139560";
  const region = process.env.NEXT_PUBLIC_HUBSPOT_REGION || "na2";

  return (
    <Script
      id="hs-script-loader"
      type="text/javascript"
      strategy="afterInteractive"
      src={`//js-${region}.hs-scripts.com/${portalId}.js`}
      async
      defer
    />
  );
}
