"use client";

import { useTransition } from "react";

import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { signOut } from "@/lib/actions/auth";

type NavbarProps = {
  userEmail: string | undefined;
};

export function Navbar({ userEmail }: NavbarProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        <span className="text-xl font-bold tracking-tight text-fb-galaxy">
          Fastbreak
        </span>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userEmail}
            </span>
          )}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            disabled={isPending}
            aria-label="Sign out"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span className="ml-1 hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
