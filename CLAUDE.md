# CLAUDE.md — Fastbreak Event Dashboard

This file provides guidance for Claude when working on the Fastbreak Event Dashboard codebase.

---

## Project Overview

Full-stack sports event management application built for Fastbreak AI. Users authenticate via Google SSO, then create, view, search, filter, edit, and delete sports events with associated venue information. Deployed on Vercel with Supabase as the backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Forms | react-hook-form + zodResolver + shadcn Form |
| Validation | Zod |
| Toasts | Sonner |
| Icons | Lucide React |
| Fonts | Geist Sans / Geist Mono (via Next.js) |
| Auth | Supabase Auth with Google OAuth SSO |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — HTML shell, fonts, Sonner Toaster
│   ├── page.tsx                      # Root redirect → /dashboard or /login
│   ├── globals.css                   # Tailwind base styles + shadcn CSS vars
│   ├── login/page.tsx                # Login page — Google SSO button
│   ├── auth/callback/route.ts        # OAuth callback route handler (only API route)
│   ├── dashboard/
│   │   ├── layout.tsx                # Protected layout — Navbar wrapper
│   │   ├── page.tsx                  # Dashboard — reads search params, fetches events
│   │   └── loading.tsx               # Skeleton loading state
│   └── events/
│       ├── new/page.tsx              # Create event page
│       └── [id]/edit/page.tsx        # Edit event page
├── components/
│   ├── ui/                           # shadcn/ui components (auto-generated, do not edit)
│   ├── layout/navbar.tsx             # Client — app name, user info, sign out
│   ├── dashboard/
│   │   ├── search-filter-bar.tsx     # Client — search input, sport dropdown
│   │   ├── event-card.tsx            # Client — single event card with edit/delete
│   │   ├── event-grid.tsx            # Client — responsive grid of event cards
│   │   ├── empty-state.tsx           # Server — no events message + CTA
│   │   └── delete-event-dialog.tsx   # Client — confirmation dialog for delete
│   └── events/event-form.tsx         # Client — shared create/edit form
├── lib/
│   ├── utils.ts                      # shadcn cn() utility
│   ├── supabase/
│   │   ├── server.ts                 # Server Supabase client (cookies-based)
│   │   └── middleware.ts             # Middleware Supabase client
│   ├── actions/
│   │   ├── safe-action.ts            # Generic createSafeAction<TInput, TOutput> wrapper
│   │   ├── auth.ts                   # signInWithGoogle, signOut, getUser
│   │   └── events.ts                 # createEvent, updateEvent, deleteEvent, searchEvents, getEventById
│   ├── types/index.ts                # Event, Venue, ActionResult, SPORT_TYPES constant
│   └── validations/event.ts          # Zod schemas: createEventSchema, updateEventSchema, searchEventsSchema, venueSchema
└── middleware.ts                     # Root middleware — route protection
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role key (server-only, never NEXT_PUBLIC_)
```

---

## Common Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npx shadcn@latest add    # Add shadcn components
```

---

## Architecture Principles

### Server Actions Over API Routes
All data mutations and parameterized queries use `"use server"` actions. The **only** API route is `/auth/callback/route.ts` (required by OAuth flow). Never create additional API routes.

### No Browser Supabase Client
All Supabase calls go through `src/lib/supabase/server.ts`. Components never import the Supabase client directly — they call server actions instead.

### createSafeAction Pattern
All mutations use `createSafeAction(zodSchema, handler)` which provides:
- Zod input validation
- try/catch error handling
- Typed `ActionResult<T>` return: `{ success: true, data: T } | { success: false, error: string }`

### Server vs Client Component Boundaries
- **Server Components**: pages that fetch data, read searchParams, render static content
- **Client Components** (`"use client"`): interactive pieces only — forms, search bars, delete dialogs, navbar sign-out
- Keep client components as small as possible; push interactivity to leaf components

### URL-Driven Search & Filter
Dashboard reads `?q=` and `?sport=` from URL searchParams. The SearchFilterBar client component updates the URL; the dashboard server component refetches on every param change.

---

## Database Schema

### `events` table
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK → auth.users(id), ON DELETE CASCADE, NOT NULL |
| name | TEXT | NOT NULL |
| sport_type | TEXT | NOT NULL |
| date_time | TIMESTAMPTZ | NOT NULL |
| description | TEXT | Nullable |
| created_at | TIMESTAMPTZ | Default NOW() |
| updated_at | TIMESTAMPTZ | Default NOW() |

### `venues` table
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| event_id | UUID | FK → events(id), ON DELETE CASCADE, NOT NULL |
| name | TEXT | NOT NULL |
| address | TEXT | Nullable |
| city | TEXT | Nullable |
| state | TEXT | Nullable |
| zip_code | TEXT | Nullable |
| created_at | TIMESTAMPTZ | Default NOW() |

### RLS Policies
- Users can only SELECT/INSERT/UPDATE/DELETE their own events (`user_id = auth.uid()`)
- Venue policies tied to event ownership via subquery

---

## Coding Standards

### Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Files & folders | kebab-case | `search-filter-bar.tsx` |
| React components | PascalCase exports | `export function SearchFilterBar()` |
| Server actions | camelCase exports | `export async function createEvent()` |
| Types | PascalCase | `Event`, `Venue`, `ActionResult` |
| Constants | UPPER_SNAKE_CASE | `SPORT_TYPES` |
| Zod schemas | camelCase + Schema suffix | `createEventSchema` |

### TypeScript Rules
- Explicit return types on all exported functions
- Use `function` keyword for components and top-level functions (arrow functions for inline callbacks only)
- Named Props types for every component (`type EventCardProps = { ... }`)
- Prefer `type` over `interface`
- No `any` — use `unknown` when type is truly unknown

### Import Order (blank line between groups)
1. React / Next.js
2. External packages
3. Internal UI components (`@/components/ui/`)
4. Internal custom components (`@/components/`)
5. Internal lib (`@/lib/actions/`, `@/lib/types/`, `@/lib/validations/`, `@/lib/utils`)

Use `import type` for type-only imports.

### Styling
- Tailwind utility classes only — no CSS modules, no inline styles
- Use `cn()` from `@/lib/utils` for conditional classes
- Mobile-first responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Fastbreak brand colors via custom Tailwind tokens: `fb-aqua`, `fb-galaxy`, `fb-sky`, etc.

### Error Handling
- `throw` inside `createSafeAction` handlers (the wrapper catches and returns `ActionResult`)
- Client-side: check `result.success`, show toast via Sonner
- Never swallow errors silently

### Forms
- Always use shadcn `<Form>` + `react-hook-form` + `zodResolver`
- Never use raw `<input>` with `useState`
- Dynamic venue fields via `useFieldArray`

### Loading & Feedback
- Every mutation button shows a loading state (`useTransition` + `Loader2` spinner)
- Every mutation shows a toast on completion (success or error)
- Dashboard uses `loading.tsx` with skeleton cards

### Code Quality
- No dead code, no `console.log` in production
- Early returns over deep nesting
- No nested ternaries
- Comments for "why", not "what"
- Use `revalidatePath("/dashboard")` after mutations, not `router.refresh()`

### Commit Messages
```
feat: add event creation form with venue management
fix: handle empty search params on dashboard
refactor: simplify auth action error handling
style: align dashboard grid with design system
```

---

## Routes

| Route | Type | Auth | Purpose |
|---|---|---|---|
| `/` | Page | Any | Redirect: authed → `/dashboard`, unauthed → `/login` |
| `/login` | Page | Public | Google SSO sign-in |
| `/auth/callback` | Route Handler | Public | OAuth code exchange |
| `/dashboard` | Page | Protected | Event list + search/filter |
| `/events/new` | Page | Protected | Create event form |
| `/events/[id]/edit` | Page | Protected | Edit event form |

---

## Design System Reference

### Brand Colors (Tailwind custom tokens)
- `fb-aqua` (#17F2E3) — Primary accent, CTAs, highlights
- `fb-aqua-dark` (#0ED2C5) — Text links (WCAG AA compliant)
- `fb-sky` (#49CBE8) — Secondary accent, gradients, hover states
- `fb-galaxy` (#011627) — Primary dark background, text on light
- `fb-galaxy-light` (#0A2540) — Card backgrounds (dark mode)
- `fb-galaxy-muted` (#1B3A4B) — Borders, dividers

### Typography
- Headings: Geist Sans, Bold/Semibold
- Body: Geist Sans, Regular/Medium
- Display: `text-4xl font-bold tracking-tight`
- H1: `text-3xl font-bold tracking-tight`
- H2: `text-2xl font-semibold`
- Body: `text-base font-normal`
- Caption: `text-xs font-normal`

### Layout
- Page container: `max-w-7xl mx-auto` with responsive padding
- Event grid: 1 col mobile / 2 col tablet (md) / 3 col desktop (lg), gap-6
- Forms: single column, `max-w-2xl` centered
- Navbar: 64px height, sticky top, white bg, bottom border

### Sport Type Badge Colors
Each sport has a unique badge color scheme defined in design.md.

---

## Implementation Phases

### Phase 1: Project Scaffold & Foundation
1. Initialize Next.js 15 with TypeScript, Tailwind CSS, App Router
2. Install and configure shadcn/ui (`components.json`, base components)
3. Set up Geist font loading in root layout
4. Configure path alias `@/` in `tsconfig.json`
5. Create `.env.local` with Supabase environment variables
6. Set up Tailwind config with Fastbreak brand colors and custom tokens

### Phase 2: Supabase Setup
7. Install `@supabase/supabase-js` and `@supabase/ssr`
8. Create `src/lib/supabase/server.ts` — server-side Supabase client using cookies
9. Create `src/lib/supabase/middleware.ts` — middleware Supabase client

### Phase 3: Database Schema
10. Write SQL migration for `events` table (UUID PK, user_id FK, name, sport_type, date_time, description, timestamps)
11. Write SQL migration for `venues` table (UUID PK, event_id FK with CASCADE, name, address, city, state, zip_code, created_at)
12. Write RLS policies: users can only access their own events; venue access tied to event ownership
13. Create indexes on `events.user_id` and `venues.event_id`

### Phase 4: Types & Validation
14. Define TypeScript types in `src/lib/types/index.ts`: `Event`, `Venue`, `ActionResult<T>`, `SPORT_TYPES` constant
15. Create Zod schemas in `src/lib/validations/event.ts`: `venueSchema`, `createEventSchema`, `updateEventSchema`, `searchEventsSchema`

### Phase 5: Safe Action Helper
16. Implement `createSafeAction<TInput, TOutput>` in `src/lib/actions/safe-action.ts` — Zod validation + typed ActionResult + try/catch

### Phase 6: Middleware & Auth Protection
17. Create `src/middleware.ts` — protect routes, redirect unauthenticated users to `/login`, redirect authenticated users on `/login` to `/dashboard`

### Phase 7: Authentication
18. Create auth server actions in `src/lib/actions/auth.ts`: `signInWithGoogle()`, `signOut()`, `getUser()`
19. Create `/auth/callback/route.ts` — OAuth code exchange route handler
20. Create `/login/page.tsx` — branded login page with Google SSO button, error display for `?error=` param

### Phase 8: Root Layout & Navigation
21. Set up `app/layout.tsx` — HTML shell, Geist font, Sonner `<Toaster />` provider, globals.css
22. Configure `globals.css` with shadcn CSS variables mapped to Fastbreak brand colors
23. Create `app/dashboard/layout.tsx` — protected layout wrapping dashboard and event pages
24. Build `Navbar` client component — app name "Fastbreak", user email/avatar, sign out button, responsive

### Phase 9: Root Page
25. Create `app/page.tsx` — server component that redirects authenticated users to `/dashboard` and unauthenticated to `/login`

### Phase 10: Event Server Actions
26. Implement `searchEvents` in `src/lib/actions/events.ts` — Zod-validated, supports `?q=` name search (ILIKE) and `?sport=` filter, joins venues
27. Implement `getEventById` — fetches single event with venues, scoped to user
28. Implement `createEvent` — validates, authenticates, inserts event + venues, rolls back event if venue insert fails, revalidates `/dashboard`
29. Implement `updateEvent` — validates, authenticates, updates event, deletes old venues and re-inserts, revalidates `/dashboard`
30. Implement `deleteEvent` — authenticates, deletes event (venues cascade), revalidates `/dashboard`

### Phase 11: Dashboard — Search & Filter
31. Build `SearchFilterBar` client component — text input for name search + shadcn Select for sport type, updates URL params via `useRouter`/`useSearchParams`

### Phase 12: Dashboard — Event Display
32. Build `EventCard` client component — shadcn Card with sport badge, event name, formatted date, venue list, edit button, delete button
33. Build `EventGrid` client component — responsive CSS grid (1/2/3 columns), renders EventCards
34. Build `EmptyState` server component — icon + "No events found" + "Create your first event" CTA
35. Build `DeleteEventDialog` client component — shadcn Dialog confirmation, calls deleteEvent action, shows loading + toast

### Phase 13: Dashboard Page
36. Create `app/dashboard/page.tsx` — server component that reads `searchParams`, calls `searchEvents`, renders SearchFilterBar + EventGrid/EmptyState + "Create Event" button
37. Create `app/dashboard/loading.tsx` — skeleton cards matching event card layout

### Phase 14: Event Form
38. Build shared `EventForm` client component — shadcn Form + react-hook-form + zodResolver, event fields (name, sport_type, date_time, description)
39. Implement dynamic venue fields with `useFieldArray` — add/remove venues, minimum 1 required
40. Handle form submission: loading spinner, disable button, call createEvent or updateEvent, toast + redirect on success, toast on error

### Phase 15: Create Event Page
41. Create `app/events/new/page.tsx` — server component shell, renders EventForm in create mode (no initial data)

### Phase 16: Edit Event Page
42. Create `app/events/[id]/edit/page.tsx` — server component, fetches event via `getEventById`, redirects if not found, renders EventForm in edit mode with default values

### Phase 17: Loading & Feedback States
43. Ensure all mutation buttons show loading state (disabled + Loader2 spinner)
44. Ensure all mutations show toast notifications (success/error messages per action)

### Phase 18: Toast Notification Messages
45. Create event: success "Event created successfully" / error "Failed to create event: {error}"
46. Update event: success "Event updated successfully" / error "Failed to update event: {error}"
47. Delete event: success "Event deleted successfully" / error "Failed to delete event: {error}"

### Phase 19: Responsive Design
48. Mobile (< 768px): single column grid, full-width cards, stacked search/filter
49. Tablet (md: 768px+): 2-column event grid
50. Desktop (lg: 1024px+): 3-column event grid, inline search + filter

### Phase 20: Error Handling
51. OAuth failure → redirect to `/login?error=auth_failed`, display error on login page
52. Dashboard load failure → "Failed to load events" with retry
53. Event not found on edit → redirect to `/dashboard`
54. Form validation errors → inline under each field via react-hook-form
55. Server action failures → toast with error message

### Phase 21: Accessibility
56. WCAG AA color contrast compliance (use `fb-aqua-dark` for text links)
57. Visible focus rings on all interactive elements
58. Keyboard navigation — tabbable elements, dialog focus trap, Escape closes dialogs
59. Semantic HTML, ARIA labels on icon-only buttons
60. Minimum 44x44px touch targets on mobile
61. Respect `prefers-reduced-motion`

### Phase 22: Login Page Styling
62. Centered card on Galaxy Black background, white rounded-xl card, Google sign-in button, error banner, "Powered by Fastbreak AI" footer

### Phase 23: Dashboard Styling
63. Page title + "Create Event" button header, search/filter bar below, responsive event grid, skeleton loading states, empty state with CalendarX2 icon

### Phase 24: Event Form Styling
64. Centered max-w-2xl white card, "Back to Dashboard" ghost button, stacked fields with gap-6, venue sections with separator, full-width large submit button

### Phase 25: Delete Dialog Styling
65. Black 50% overlay, centered white dialog, warning icon, event name in message, Cancel + Delete buttons

### Phase 26: Final Polish
66. Remove all `console.log` statements
67. Remove unused imports and dead code
68. Verify all exported functions have explicit return types
69. Verify import sorting follows convention
70. Ensure `"use client"` is only on components that need interactivity
71. Verify no raw Supabase calls in components

### Phase 27: Deployment
72. Push clean commits to GitHub (`julanbasnet/Sports-Event-Management`)
73. Connect repo to Vercel, set environment variables
74. Verify production build succeeds
75. Test deployed URL end-to-end

---

## Key Patterns to Follow

### Server Action Example
```typescript
"use server";

import { createSafeAction } from "@/lib/actions/safe-action";
import { createClient } from "@/lib/supabase/server";
import { createEventSchema } from "@/lib/validations/event";

export const createEvent = createSafeAction(createEventSchema, async (data) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in");

  // Insert event, then venues...
  return event;
});
```

### Client Component Calling Action
```typescript
"use client";

import { useTransition } from "react";
import { toast } from "sonner";

const [isPending, startTransition] = useTransition();

startTransition(async () => {
  const result = await createEvent(formData);
  if (result.success) {
    toast.success("Event created successfully");
  } else {
    toast.error(result.error);
  }
});
```

### Dashboard Server Component
```typescript
// app/dashboard/page.tsx — Server Component
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string; sport?: string }> }) {
  const params = await searchParams;
  const result = await searchEvents({ query: params.q, sport_type: params.sport });
  // Render SearchFilterBar + EventGrid or EmptyState
}
```
