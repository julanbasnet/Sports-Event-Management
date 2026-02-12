"use client";

import { useState } from "react";
import Link from "next/link";

import { Calendar, MapPin, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DeleteEventDialog } from "@/components/dashboard/delete-event-dialog";

import type { Event } from "@/lib/types";

type EventCardProps = {
  event: Event;
};

const SPORT_BADGE_COLORS: Record<string, string> = {
  Soccer: "bg-green-100 text-green-800 border-green-200",
  Basketball: "bg-amber-100 text-amber-800 border-amber-200",
  Tennis: "bg-blue-100 text-blue-800 border-blue-200",
  Baseball: "bg-red-100 text-red-800 border-red-200",
  Football: "bg-purple-100 text-purple-800 border-purple-200",
  Hockey: "bg-sky-100 text-sky-800 border-sky-200",
  Volleyball: "bg-orange-100 text-orange-800 border-orange-200",
  Cricket: "bg-green-50 text-green-700 border-green-100",
  Golf: "bg-emerald-50 text-emerald-800 border-emerald-100",
  Swimming: "bg-sky-50 text-sky-900 border-sky-100",
};

export function EventCard({ event }: EventCardProps): React.ReactElement {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formattedDate = new Date(event.date_time).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const badgeColor =
    SPORT_BADGE_COLORS[event.sport_type] ??
    "bg-neutral-100 text-neutral-800 border-neutral-200";

  return (
    <>
      <Card className="flex flex-col transition-all duration-200 ease-in-out hover:shadow-glow hover:-translate-y-0.5 hover:border-fb-aqua/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge variant="outline" className={badgeColor}>
              {event.sport_type}
            </Badge>
          </div>
          <CardTitle className="text-xl font-semibold leading-tight mt-2">
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          {event.venues && event.venues.length > 0 && (
            <div className="space-y-1">
              {event.venues.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{venue.name}</span>
                </div>
              ))}
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="gap-2 pt-0">
          <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]" asChild>
            <Link href={`/events/${event.id}/edit`}>
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <DeleteEventDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        eventId={event.id}
        eventName={event.name}
      />
    </>
  );
}
