import Link from "next/link";

import { CalendarX2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <CalendarX2 className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">No events yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your first event to get started.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/events/new">Create Event</Link>
      </Button>
    </div>
  );
}
