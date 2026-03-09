/**
 * Server-side geolocation via ip-api.com (free, no API key required).
 * IP is read from the x-forwarded-for header set by AWS Amplify / ALB.
 * Returns null silently on any failure — never blocks signup.
 */

export type GeoLocation = {
  country_code: string | null; // ISO 3166-1 alpha-2, e.g. "US"
  country_name: string | null;
  city: string | null;
  region: string | null;
};

export async function resolveGeo(request: Request): Promise<GeoLocation | null> {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim();

    if (!ip || ip === "127.0.0.1" || ip === "::1") return null;

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "success") return null;

    return {
      country_code: data.countryCode ?? null,
      country_name: data.country ?? null,
      city: data.city ?? null,
      region: data.regionName ?? null,
    };
  } catch {
    return null;
  }
}
