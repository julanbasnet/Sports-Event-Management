export type Venue = {
  id: string;
  event_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  user_id: string;
  name: string;
  sport_type: string;
  date_time: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  venues: Venue[];
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const SPORT_TYPES = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Baseball",
  "Football",
  "Hockey",
  "Volleyball",
  "Cricket",
  "Golf",
  "Swimming",
] as const;

export type SportType = (typeof SPORT_TYPES)[number];
