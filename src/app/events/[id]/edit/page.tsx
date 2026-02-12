import { redirect } from "next/navigation";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EventForm } from "@/components/events/event-form";

import { getEventById } from "@/lib/actions/events";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({
  params,
}: EditEventPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Edit Event</h1>
        <EventForm mode="edit" defaultValues={event} />
      </div>
    </div>
  );
}
