"use client";

import Script from "next/script";

export function UmamiTracking() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "d5788833-ffbd-4ac2-8007-46e8299d53b7";

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
      defer
    />
  );
}
