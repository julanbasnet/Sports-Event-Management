# Fastbreak Event Dashboard — Coding Standards

---

## Overview

This document defines the coding standards, patterns, and conventions for the Fastbreak Event Dashboard. Every line of code must adhere to these standards. The goal is clarity, consistency, and maintainability while strictly respecting the project's technical requirements.

---

## Core Technical Constraints

These are non-negotiable. Every pattern and convention below exists to support these constraints.

| Constraint | Rule |
|---|---|
| All database interactions are server-side | No Supabase client calls from client components. Ever. |
| Server Actions over API Routes | Use `"use server"` actions for all mutations and data fetching. Only exception: `/auth/callback` route handler (OAuth requires it) |
| No `createBrowserClient` | The only Supabase client is `createClient()` from `src/lib/supabase/server.ts` |
| shadcn Form pattern | All forms use shadcn `<Form>` + `react-hook-form` + `zodResolver`. No raw `<form>` elements with manual state |
| Type safety everywhere | Zod for validation, TypeScript for types, `ActionResult<T>` for action returns |

---

## File & Folder Conventions

### Naming

| Type | Convention | Example |
|---|---|---|
| Files & folders | `kebab-case` | `search-filter-bar.tsx`, `safe-action.ts` |
| React components | `PascalCase` exports | `export function SearchFilterBar()` |
| Server actions | `camelCase` exports | `export async function createEvent()` |
| Types & interfaces | `PascalCase` | `Event`, `Venue`, `ActionResult` |
| Constants | `UPPER_SNAKE_CASE` | `SPORT_TYPES` |
| Zod schemas | `camelCase` + `Schema` suffix | `createEventSchema`, `venueSchema` |

### File Organization

```
imports        → External packages first, then internal (@/ alias), then relative
                 Blank line between groups

"use server"   → Top of file, before imports, only in server action files
"use client"   → Top of file, before imports, only when the component needs interactivity

types          → Colocated in src/lib/types/index.ts, not scattered across files
validations    → Colocated in src/lib/validations/event.ts
actions        → One file per domain: auth.ts, events.ts
components     → One component per file, named to match the export
```

---

## TypeScript Standards

### Use explicit return types on all exported functions

```typescript
// Good
export async function getEventById(eventId: string): Promise<Event | null> {
  // ...
}

// Bad
export async function getEventById(eventId: string) {
  // ...
}
```

### Use `function` keyword for component and top-level function declarations

```typescript
// Good
export function EventCard({ event }: EventCardProps) {
  return <div>...</div>;
}

// Bad
export const EventCard = ({ event }: EventCardProps) => {
  return <div>...</div>;
};
```

Arrow functions are acceptable for inline callbacks, event handlers, and `.map()` / `.filter()` chains.

```typescript
// Fine — inline callbacks
onClick={() => router.push("/events/new")}
events.map((event) => <EventCard key={event.id} event={event} />)
```

### Define explicit Props types for every component

```typescript
// Good
type EventCardProps = {
  event: Event;
  onDelete: (id: string) => void;
};

export function EventCard({ event, onDelete }: EventCardProps) {
  // ...
}

// Bad — inline destructuring without a named type
export function EventCard({ event, onDelete }: { event: Event; onDelete: (id: string) => void }) {
  // ...
}
```

### Prefer `type` over `interface` for consistency

```typescript
// Good
type EventCardProps = {
  event: Event;
};

// Avoid
interface EventCardProps {
  event: Event;
}
```

### No `any`. Use `unknown` when the type is truly unknown.

```typescript
// Good
catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong";
}

// Bad
catch (error: any) {
  console.log(error.message);
}
```

---

## React Component Patterns

### Server vs Client component rules

| If the component... | Then it is... |
|---|---|
| Fetches data from Supabase | Server Component |
| Reads `searchParams` or `params` | Server Component |
| Renders static content only | Server Component |
| Has `onClick`, `onChange`, or any event handler | Client Component (`"use client"`) |
| Uses `useState`, `useEffect`, `useTransition` | Client Component |
| Uses `useForm`, `useFieldArray` | Client Component |
| Uses `useRouter`, `useSearchParams`, `usePathname` | Client Component |

### Keep client components as small as possible

Push interactivity to the smallest possible component. Don't mark an entire page as `"use client"` just because one button needs an `onClick`.

```typescript
// Good — page is Server, only the interactive piece is Client
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage({ searchParams }: Props) {
  const result = await searchEvents({ query: searchParams.q, sport_type: searchParams.sport });
  return (
    <div>
      <SearchFilterBar />          {/* Client Component */}
      <EventGrid events={result} /> {/* Client Component */}
    </div>
  );
}
```

```typescript
// Bad — entire page is Client just for search functionality
"use client";
export default function DashboardPage() {
  // Now everything is client-rendered, defeating SSR
}
```

### No direct Supabase calls in components

Components never import from `@/lib/supabase/server`. They call server actions, which internally use the Supabase client.

```typescript
// Good — component calls a server action
import { searchEvents } from "@/lib/actions/events";
const result = await searchEvents({ query, sport_type });

// Bad — component creates its own Supabase client
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
const { data } = await supabase.from("events").select("*");
```

---

## Server Action Patterns

### Always use `createSafeAction` for mutations and parameterized queries

```typescript
// Good
export const createEvent = createSafeAction(createEventSchema, async (data) => {
  const supabase = await createClient();
  // ...
});

// Bad — raw action without validation wrapper
export async function createEvent(data: CreateEventInput) {
  // No Zod validation, no consistent error shape
}
```

### Always authenticate in every action that touches user data

```typescript
export const createEvent = createSafeAction(createEventSchema, async (data) => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in");
  }

  // Now proceed with user.id
});
```

### Return `ActionResult<T>`, never raw data or void

The `createSafeAction` wrapper handles this automatically. For standalone actions (like `deleteEvent`), manually return the shape:

```typescript
// Good
return { success: true, data: events };

// Bad
return events;
```

### Use `revalidatePath` after mutations, not `router.refresh()`

```typescript
// Good — inside server action
revalidatePath("/dashboard");

// Bad — inside client component after action call
router.refresh();
```

---

## Form Patterns

### Always use shadcn Form + react-hook-form + zodResolver

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createEventSchema, type CreateEventInput } from "@/lib/validations/event";

export function EventForm() {
  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      sport_type: undefined,
      date_time: "",
      description: "",
      venues: [{ name: "", address: "", city: "", state: "", zip_code: "" }],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Never use raw `<input>` with `useState` for form fields

```typescript
// Bad
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />

// Good — always through react-hook-form
<FormField control={form.control} name="name" render={({ field }) => (
  <FormControl><Input {...field} /></FormControl>
)} />
```

---

## Error Handling

### Use `throw` inside `createSafeAction` handlers — the wrapper catches it

```typescript
// Good — throw, let createSafeAction catch and return ActionResult
export const createEvent = createSafeAction(createEventSchema, async (data) => {
  const { error } = await supabase.from("events").insert(row);
  if (error) {
    throw new Error(error.message);
  }
  // ...
});
```

### Client-side: check `result.success` and show toast

```typescript
// Good
const result = await createEvent(formData);
if (result.success) {
  toast.success("Event created successfully");
} else {
  toast.error(result.error);
}
```

### Never swallow errors silently

```typescript
// Bad
try {
  await deleteEvent(id);
} catch {
  // silently ignored
}

// Good
try {
  const result = await deleteEvent(id);
  if (!result.success) {
    toast.error("Failed to delete event");
  }
} catch (error: unknown) {
  toast.error("An unexpected error occurred");
}
```

---

## Styling Standards

### Use Tailwind utility classes. No custom CSS files.

```typescript
// Good
<div className="flex items-center gap-4 p-6 rounded-lg border border-neutral-200">

// Bad
<div className={styles.container}>  // CSS modules
<div style={{ display: "flex" }}>   // inline styles
```

### Use `cn()` from `@/lib/utils` for conditional classes

```typescript
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded-md text-sm font-medium",
  isLoading && "opacity-50 cursor-not-allowed",
  variant === "destructive" && "bg-red-500 text-white"
)}>
```

### Follow the design system spacing and color tokens

Use Fastbreak brand colors via custom Tailwind classes (`fb-aqua`, `fb-galaxy`, etc.) defined in `tailwind.config.ts`. Reference `design.md` for all tokens.

### Responsive design is mobile-first

```typescript
// Good — mobile-first, then override for larger screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Bad — desktop-first
<div className="grid grid-cols-3 sm:grid-cols-1">
```

---

## Import Sorting

Imports are grouped in this order, with a blank line between groups:

```typescript
// 1. React / Next.js
import { Suspense } from "react";
import { redirect } from "next/navigation";

// 2. External packages
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// 3. Internal — UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// 4. Internal — custom components
import { EventCard } from "@/components/dashboard/event-card";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";

// 5. Internal — lib (actions, types, utils, validations)
import { createEvent } from "@/lib/actions/events";
import type { Event } from "@/lib/types";
import { createEventSchema } from "@/lib/validations/event";
import { cn } from "@/lib/utils";
```

### Use `type` imports when importing only types

```typescript
// Good
import type { Event, Venue } from "@/lib/types";

// Bad
import { Event, Venue } from "@/lib/types";
```

---

## Code Clarity Rules

### No nested ternaries

```typescript
// Bad
const label = status === "active" ? "Active" : status === "pending" ? "Pending" : "Inactive";

// Good
function getStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Pending";
    default:
      return "Inactive";
  }
}
```

### Prefer early returns to reduce nesting

```typescript
// Good
export async function getEventById(eventId: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

// Bad — deeply nested
export async function getEventById(eventId: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("events")
      .select("*, venues(*)")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!error) {
      return data as Event;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
```

### One responsibility per function

```typescript
// Good — separate concerns
async function insertEvent(supabase: Client, data: CreateEventInput, userId: string) { ... }
async function insertVenues(supabase: Client, venues: VenueInput[], eventId: string) { ... }

// Bad — one function doing everything
async function createEventWithVenuesAndNotify(data: any) {
  // 100 lines of mixed concerns
}
```

### Remove obvious comments. Keep comments for "why", not "what".

```typescript
// Bad
// Get the user
const { data: { user } } = await supabase.auth.getUser();
// Check if user exists
if (!user) return null;

// Good — no comment needed, the code is self-explanatory
const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;

// Good — explains WHY, not what
// Delete existing venues first, then re-insert — simpler than diffing changes
await supabase.from("venues").delete().eq("event_id", data.id);
```

---

## Loading & Feedback Standards

### Every mutation button must show a loading state

```typescript
const [isPending, startTransition] = useTransition();

<Button disabled={isPending}>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Creating...
    </>
  ) : (
    "Create Event"
  )}
</Button>
```

### Every mutation must show a toast on completion

```typescript
// After every server action call
if (result.success) {
  toast.success("Event created successfully");
} else {
  toast.error(result.error);
}
```

### Dashboard uses `loading.tsx` for initial page load skeleton

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  );
}
```

---

## Git & Code Quality

### Commit messages

```
feat: add event creation form with venue management
fix: handle empty search params on dashboard
refactor: simplify auth action error handling
style: align dashboard grid with design system
```

### No dead code

Remove unused imports, variables, functions, and commented-out code before committing.

### No `console.log` in production code

Use `console.error` only inside `createSafeAction` catch blocks for server-side error logging. Remove all `console.log` debugging statements.

---

## Checklist Before Every File

- [ ] Is `"use client"` only added when the component genuinely needs interactivity?
- [ ] Are all Supabase calls inside server actions, never in components?
- [ ] Does every exported function have an explicit return type?
- [ ] Are imports sorted correctly with blank lines between groups?
- [ ] Are type-only imports using the `type` keyword?
- [ ] Is Tailwind used for all styling with no custom CSS?
- [ ] Are forms using shadcn Form + react-hook-form + zodResolver?
- [ ] Do all mutations show loading states and toast notifications?
- [ ] Is error handling consistent using `ActionResult<T>`?
- [ ] Are there no nested ternaries?
- [ ] Is the component as small as possible with interactivity pushed to leaves?
