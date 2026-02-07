import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] h-72 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-blue-500/15 blur-3xl" />
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <Link href="/jobs" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to jobs
        </Link>
        <Card className="border-slate-800/80 bg-slate-900/70 shadow-lg">
          <CardContent className="space-y-2 p-6">
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="text-sm text-slate-300">Settings coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
