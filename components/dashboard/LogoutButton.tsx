"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type LogoutButtonProps = {
  onLogout: () => Promise<void> | void;
  isLoading?: boolean;
};

export function LogoutButton({ onLogout, isLoading }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();
  const loading = isLoading ?? pending;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startTransition(() => void onLogout())}
      disabled={loading}
    >
      {loading ? <Spinner className="mr-2" size="sm" /> : null}
      Log out
    </Button>
  );
}
