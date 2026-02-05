import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type DashboardFooterProps = {
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function DashboardFooter({ onLogout, isLoggingOut }: DashboardFooterProps) {
  return (
    <div className="flex justify-center pt-2">
      <Button
        variant="ghost"
        className="text-xs text-slate-400 hover:text-slate-200"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? <Spinner className="mr-2" size="sm" /> : null}
        Log out
      </Button>
    </div>
  );
}
