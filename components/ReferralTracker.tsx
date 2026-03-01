"use client";

import { useEffect } from "react";

const COOKIE_NAME = "nayld_ref";
const COOKIE_MAX_AGE = 60 * 24 * 60 * 60; // 60 days in seconds
const LS_KEY = "nayld_referral_code";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.toUpperCase().trim();

    if (!ref) return; // No referral param — nothing to do

    // First-touch attribution: never overwrite an existing referral cookie
    if (getCookie(COOKIE_NAME)) return;

    // Set cookie
    document.cookie = `${COOKIE_NAME}=${ref}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
    localStorage.setItem(LS_KEY, ref);

    // Strip ?ref= from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState(null, "", url.toString());

    // Fire-and-forget click tracking
    fetch("/api/affiliate/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referral_code: ref,
        landing_page: window.location.pathname,
        referrer_url: document.referrer || undefined,
      }),
    }).catch(() => {}); // Silently ignore network errors
  }, []);

  return null;
}
