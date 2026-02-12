import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EventForm } from "@/components/events/event-form";

export default function CreateEventPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" className="text-fb-aqua-dark hover:text-fb-aqua-dark min-h-[44px]" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Create Event
        </h1>
        <EventForm mode="create" />
      </div>
    </div>
  );
}
