import { Suspense } from "react";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EventGrid } from "@/components/dashboard/event-grid";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DashboardError } from "@/components/dashboard/dashboard-error";

import { searchEvents } from "@/lib/actions/events";
import type { ActionResult, Event } from "@/lib/types";

type DashboardPageProps = {
  searchParams: Promise<{ q?: string; sport?: string }>;
};

function EventContent({ result }: { result: ActionResult<Event[]> }): React.ReactElement {
  if (!result.success) {
    return <DashboardError message={result.error} />;
  }

  if (result.data.length === 0) {
    return <EmptyState />;
  }

  return <EventGrid events={result.data} />;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const result = await searchEvents({
    query: params.q ?? "",
    sport_type: params.sport ?? "",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button className="min-h-[44px]" asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      <EventContent result={result} />
    </div>
  );
}
