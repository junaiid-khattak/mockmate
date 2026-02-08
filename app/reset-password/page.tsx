import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/reset-password/ResetPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default async function Page() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.recovery_sent_at) {
    redirect("/login");
  }

  async function handleReset(payload: { password: string }) {
    "use server";
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: payload.password });

    if (error) {
      return { ok: false, error: "Unable to update password." };
    }

    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] -z-10 h-64 bg-gradient-to-r from-mm-violet/25 via-purple-300/20 to-blue-300/25 blur-3xl" />
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center">
        <div className="mb-6 space-y-2 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mm-violet to-mm-blue text-white shadow-sm">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <span className="text-lg font-semibold text-slate-900">nayld.ai</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Set a new password</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Choose a strong password to secure your account.</p>
        </div>

        <Card className="w-full border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <ResetPasswordForm onSubmit={handleReset} />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <Link href="/login" className="text-mm-violet hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
