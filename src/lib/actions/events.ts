"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/actions/safe-action";
import { createClient } from "@/lib/supabase/server";
import type { Event, ActionResult } from "@/lib/types";
import {
  createEventSchema,
  updateEventSchema,
  searchEventsSchema,
} from "@/lib/validations/event";

export const searchEvents = createSafeAction(
  searchEventsSchema,
  async (data): Promise<Event[]> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in");
    }

    let query = supabase
      .from("events")
      .select("*, venues(*)")
      .eq("user_id", user.id)
      .order("date_time", { ascending: true });

    if (data.query) {
      query = query.ilike("name", `%${data.query}%`);
    }

    if (data.sport_type) {
      query = query.eq("sport_type", data.sport_type);
    }

    const { data: events, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (events ?? []) as Event[];
  }
);

export async function getEventById(
  eventId: string
): Promise<Event | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("events")
    .select("*, venues(*)")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (error) return null;

  return data as Event;
}

export const createEvent = createSafeAction(
  createEventSchema,
  async (data): Promise<Event> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in");
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        name: data.name,
        sport_type: data.sport_type,
        date_time: data.date_time,
        description: data.description || null,
      })
      .select()
      .single();

    if (eventError || !event) {
      throw new Error(eventError?.message ?? "Failed to create event");
    }

    const venueRows = data.venues.map((venue) => ({
      event_id: event.id,
      name: venue.name,
      address: venue.address || null,
      city: venue.city || null,
      state: venue.state || null,
      zip_code: venue.zip_code || null,
    }));

    const { error: venueError } = await supabase
      .from("venues")
      .insert(venueRows);

    if (venueError) {
      // Rollback: delete the event if venue insertion fails
      await supabase.from("events").delete().eq("id", event.id);
      throw new Error(venueError.message);
    }

    revalidatePath("/dashboard");
    return event as Event;
  }
);

export const updateEvent = createSafeAction(
  updateEventSchema,
  async (data): Promise<Event> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in");
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .update({
        name: data.name,
        sport_type: data.sport_type,
        date_time: data.date_time,
        description: data.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (eventError || !event) {
      throw new Error(eventError?.message ?? "Failed to update event");
    }

    // Delete existing venues first, then re-insert — simpler than diffing changes
    await supabase.from("venues").delete().eq("event_id", data.id);

    const venueRows = data.venues.map((venue) => ({
      event_id: data.id,
      name: venue.name,
      address: venue.address || null,
      city: venue.city || null,
      state: venue.state || null,
      zip_code: venue.zip_code || null,
    }));

    const { error: venueError } = await supabase
      .from("venues")
      .insert(venueRows);

    if (venueError) {
      throw new Error(venueError.message);
    }

    revalidatePath("/dashboard");
    return event as Event;
  }
);

export async function deleteEvent(
  eventId: string
): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: null };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
