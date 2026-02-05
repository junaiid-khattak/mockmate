import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function Page() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function handleLogout() {
    "use server";
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return <DashboardShell userEmail={user.email ?? "member"} onLogout={handleLogout} />;
}
