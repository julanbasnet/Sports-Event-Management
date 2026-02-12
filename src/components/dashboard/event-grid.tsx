"use client";

import { EventCard } from "@/components/dashboard/event-card";

import type { Event } from "@/lib/types";

type EventGridProps = {
  events: Event[];
};

export function EventGrid({ events }: EventGridProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
