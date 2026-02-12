import { Suspense } from "react";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";
import { EventGrid } from "@/components/dashboard/event-grid";
import { EmptyState } from "@/components/dashboard/empty-state";

import { searchEvents } from "@/lib/actions/events";

type DashboardPageProps = {
  searchParams: Promise<{ q?: string; sport?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const result = await searchEvents({
    query: params.q ?? "",
    sport_type: params.sport ?? "",
  });

  const events = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      {!result.success ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          Failed to load events. Please try refreshing the page.
        </div>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <EventGrid events={events} />
      )}
    </div>
  );
}
