import { z } from "zod";

import { SPORT_TYPES } from "@/lib/types";

export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
});

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  sport_type: z.enum(SPORT_TYPES, {
    error: "Please select a sport type",
  }),
  date_time: z.string().min(1, "Date and time is required"),
  description: z.string(),
  venues: z
    .array(venueSchema)
    .min(1, "At least one venue is required"),
});

export const updateEventSchema = createEventSchema.extend({
  id: z.string().uuid("Invalid event ID"),
});

export const getEventByIdSchema = z.object({
  id: z.string().uuid("Invalid event ID"),
});

export const deleteEventSchema = z.object({
  id: z.string().uuid("Invalid event ID"),
});

export const searchEventsSchema = z.object({
  query: z.string().optional(),
  sport_type: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type SearchEventsInput = z.infer<typeof searchEventsSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
