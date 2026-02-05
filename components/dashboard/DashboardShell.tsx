import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Sparkles } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

type DashboardShellProps = {
  userEmail: string;
  onLogout: () => Promise<void> | void;
  isLoggingOut?: boolean;
};

export function DashboardShell({ userEmail, onLogout, isLoggingOut }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            MockMate
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="hidden sm:inline">{userEmail}</span>
            <LogoutButton onLogout={onLogout} isLoading={isLoggingOut} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Welcome back. Your next mock is one click away.</p>
          </div>
          <Badge variant="outline">Beta</Badge>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Plan / Minutes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-semibold">120</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Minutes available</p>
              <Badge variant="outline">Pro</Badge>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Start Interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Resume-linked sessions will appear here.
              </p>
              <Button disabled className="w-full">
                Start new mock
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                No sessions yet
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your completed mocks will show here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
