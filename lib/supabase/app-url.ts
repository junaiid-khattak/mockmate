export function getAppUrl(request?: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (request) {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) {
      return `${proto}://${host}`;
    }
  }

  return "http://localhost:3000";
}
