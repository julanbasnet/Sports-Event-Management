"use client";

import { useRouter } from "next/navigation";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  message: string;
};

export function DashboardError({ message }: DashboardErrorProps): React.ReactElement {
  const router = useRouter();

  return (
    <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
      <p>Failed to load events: {message}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 min-h-[44px] min-w-[44px]"
        onClick={() => router.refresh()}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
