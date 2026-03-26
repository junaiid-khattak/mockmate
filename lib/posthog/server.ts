import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getServerPostHog(): PostHog {
  if (!client) {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!apiKey) {
      throw new Error("Missing NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN");
    }
    client = new PostHog(apiKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}
