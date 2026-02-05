import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name, options) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

type CookieChange = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export function createRouteHandlerSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  const cookieChanges: CookieChange[] = [];

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        cookieChanges.push({ name, value, options });
      },
      remove(name, options) {
        cookieChanges.push({ name, value: "", options: { ...options, maxAge: 0 } });
      },
    },
  });

  const applyCookies = (response: NextResponse) => {
    cookieChanges.forEach(({ name, value, options }) => {
      response.cookies.set({ name, value, ...(options ?? {}) });
    });
  };

  return { supabase, applyCookies };
}

export function createServiceRoleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
