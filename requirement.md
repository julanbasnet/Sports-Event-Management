# Fastbreak Event Dashboard — Requirements

## Technical Stack

| Technology | Version/Choice |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Database | Supabase |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Deployment | Vercel |
| Authentication | Supabase Auth (Google SSO) |

---

## Phase 1: Foundation

| # | Task | Detail |
|---|---|---|
| 1.1 | Project scaffold | Next.js 15, TypeScript, Tailwind, shadcn initialized |
| 1.2 | Supabase clients | Server client (`server.ts`), middleware client (`middleware.ts`) |
| 1.3 | Middleware | Route protection — unauthenticated users redirect to `/login`, authenticated users on `/login` redirect to `/dashboard` |
| 1.4 | Safe action helper | Generic `createSafeAction<TInput, TOutput>` — Zod validation + typed `ActionResult<T>` + consistent error handling |
| 1.5 | Types & validation schemas | `Event`, `Venue`, `ActionResult` types. Zod schemas for create, update, search |
| 1.6 | Environment variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 1.7 | Database schema | `events` table, `venues` table, RLS policies, indexes — run in Supabase SQL editor |

---

## Phase 2: Authentication

| # | Task | Detail |
|---|---|---|
| 2.1 | Auth server actions | `signInWithGoogle()` — initiates OAuth flow with redirect to `/auth/callback`. `signOut()` — clears session, redirects to `/login`. `getUser()` — returns current authenticated user or null |
| 2.2 | `/login` page | Branded page with app name/logo, "Sign in with Google" button, error message display if `?error=` query param is present (e.g. OAuth failure) |
| 2.3 | `/auth/callback` route | Route handler (only API route in the app). Exchanges OAuth code for session. Success → redirect to `/dashboard`. Failure → redirect to `/login?error=auth_failed` |
| 2.4 | `/` root page | Server component. Authenticated → redirect to `/dashboard`. Not authenticated → redirect to `/login` |

---

## Phase 3: Layout

| # | Task | Detail |
|---|---|---|
| 3.1 | Root layout | `app/layout.tsx` — HTML shell, font loading, Sonner `<Toaster />` provider |
| 3.2 | Dashboard layout | `app/dashboard/layout.tsx` or shared layout wrapping all protected pages. Contains the navbar |
| 3.3 | Navbar component | App name ("Fastbreak"), user email or avatar from Google profile, sign out button. Responsive — works on mobile and desktop |

---

## Phase 4: Dashboard

| # | Task | Detail |
|---|---|---|
| 4.1 | Dashboard page | **Server Component**. Reads URL search params (`?q=` for name search, `?sport=` for sport filter). Calls `searchEvents` server action with those params. Passes results to child components |
| 4.2 | Search/filter bar | **Client Component**. Text input for name search + shadcn Select dropdown for sport type. On change → updates URL search params via `useRouter` + `useSearchParams` → triggers page re-render → server-side refetch from database |
| 4.3 | Event card | shadcn `Card` component displaying: event name (title), sport type (shadcn `Badge`), formatted date & time, list of venue names, edit button, delete button |
| 4.4 | Event grid | Responsive CSS grid layout. 1 column on mobile, 2 columns on tablet (`md:`), 3 columns on desktop (`lg:`) |
| 4.5 | Empty state | Displayed when no events exist or search/filter returns no results. Icon + "No events found" message + "Create your first event" button linking to `/events/new` |
| 4.6 | Loading state | `loading.tsx` file in dashboard route. Skeleton cards matching the event card layout using shadcn `Skeleton` |
| 4.7 | "Create Event" button | Prominent button at top of dashboard. Navigates to `/events/new` |
| 4.8 | Edit action per card | Button/link on each event card. Navigates to `/events/[id]/edit` |
| 4.9 | Delete action per card | Button on each event card. Opens shadcn `Dialog` for confirmation ("Are you sure?"). On confirm → calls `deleteEvent` server action → success toast or error toast |

---

## Phase 5: Event Management

### 5A: Event Form (Shared Component)

| # | Task | Detail |
|---|---|---|
| 5.1 | Event form component | **Client Component**. Shared between create and edit. Uses shadcn `Form` + `react-hook-form` + `zodResolver` with Zod validation schema |
| 5.2 | Event fields | `name` — shadcn `Input` (required). `sport_type` — shadcn `Select` with options from `SPORT_TYPES` constant (required). `date_time` — `<input type="datetime-local">` (required). `description` — shadcn `Textarea` (optional) |
| 5.3 | Dynamic venue fields | Array field using `useFieldArray` from react-hook-form. Each venue has: `name` (required, shadcn Input), `address` (optional), `city` (optional), `state` (optional), `zip_code` (optional). "Add Venue" button appends a new blank venue. "Remove" button on each venue (disabled if only 1 venue remains). Minimum 1 venue required. No maximum limit |
| 5.4 | Form submission | Disable submit button + show loading spinner during submission. On success → toast notification + redirect to `/dashboard`. On error → toast notification with error message |

### 5B: Create Event

| # | Task | Detail |
|---|---|---|
| 5.5 | `/events/new` page | Server Component shell with page title "Create Event". Renders `EventForm` in create mode (no initial data) |
| 5.6 | `createEvent` server action | Validates input with `createEventSchema`. Authenticates user via `getUser()`. Inserts event into `events` table. Inserts venues into `venues` table. Rollback: deletes event if venue insertion fails. Calls `revalidatePath("/dashboard")`. Redirects to `/dashboard` |

### 5C: Edit Event

| # | Task | Detail |
|---|---|---|
| 5.7 | `/events/[id]/edit` page | **Server Component**. Fetches event by ID via `getEventById` server action. If event not found → redirect to `/dashboard` (or show not found). Passes event data as default values to `EventForm` in edit mode |
| 5.8 | `updateEvent` server action | Validates input with `updateEventSchema` (includes event ID). Authenticates user. Updates event fields in `events` table. Deletes existing venues for this event, re-inserts new venue list. Calls `revalidatePath("/dashboard")`. Redirects to `/dashboard` |

### 5D: Delete Event

| # | Task | Detail |
|---|---|---|
| 5.9 | `deleteEvent` server action | Takes `eventId` string. Authenticates user. Deletes from `events` table (venues cascade-delete via FK). Returns success/error |
| 5.10 | Delete UI flow | Delete button on event card → opens confirmation dialog → on confirm: call action → success toast "Event deleted" → `revalidatePath` refreshes list. On error → error toast |

---

## Phase 6: Polish & Deploy

### 6A: Error Handling

| # | Scenario | Behavior |
|---|---|---|
| 6.1 | OAuth failure | Redirect to `/login?error=auth_failed`, display error message on login page |
| 6.2 | Dashboard load failure | Show error message "Failed to load events" with retry option |
| 6.3 | Event not found (edit page) | Redirect to `/dashboard` or show "Event not found" |
| 6.4 | Form validation errors | Inline field errors via react-hook-form + Zod, displayed under each field |
| 6.5 | Server action failure | Toast notification with error message |

### 6B: Toast Notifications

| Action | Success Toast | Error Toast |
|---|---|---|
| Create event | "Event created successfully" | "Failed to create event: {error}" |
| Update event | "Event updated successfully" | "Failed to update event: {error}" |
| Delete event | "Event deleted successfully" | "Failed to delete event: {error}" |
| Auth error | — | "Authentication failed. Please try again." |

### 6C: Loading States

| Location | Implementation |
|---|---|
| Dashboard page | `loading.tsx` with skeleton cards (shadcn `Skeleton`) |
| Form submission | Disabled submit button + spinner icon |
| Delete action | Disabled delete button + spinner during action |

### 6D: Responsive Design

| Breakpoint | Layout |
|---|---|
| Mobile (`< 768px`) | Single column grid, full-width cards, hamburger/simplified nav |
| Tablet (`md: 768px+`) | 2-column event grid |
| Desktop (`lg: 1024px+`) | 3-column event grid |

### 6E: Submission

| # | Task | Detail |
|---|---|---|
| 6.6 | README.md | Hand-written by developer. Sections: project overview, architecture decisions, trade-offs, setup instructions, tech stack rationale. **Not AI-generated** |
| 6.7 | Push to GitHub | Repository: `julanbasnet/Sports-Event-Management`. Clean commits |
| 6.8 | Deploy to Vercel | Connect GitHub repo, set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), get public URL |

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Server Actions over API Routes | Spec requirement — "Actions over API Routes. At Fastbreak, we're pushing towards using only actions." Only exception is `/auth/callback` route handler (required by OAuth flow) |
| URL search params for search/filter | Dashboard reads `?q=&sport=` from URL. Page is a Server Component that refetches from DB on every param change. Clean, bookmarkable, SSR-friendly |
| `createSafeAction` generic helper | Single wrapper for all mutations — handles Zod validation, try/catch, typed `ActionResult<T>` response. Consistent error shape across the app |
| Shared `EventForm` component | One form component handles both create and edit. Receives optional `defaultValues` prop. Reduces duplication |
| Server Components for data fetching | Dashboard page and edit page are Server Components that fetch data directly. Only interactive pieces (search bar, forms, delete dialog) are Client Components |
| Cascade delete on venues | Database FK constraint `ON DELETE CASCADE` — deleting an event automatically removes its venues |
| Venue name only required | Spec says "Venues (Plural)" without specifying fields. Name is required, address/city/state/zip are optional. At least 1 venue per event |

---

## Component Boundaries

| Component | Server / Client | Reason |
|---|---|---|
| `/login/page.tsx` | Server | Static page, button triggers server action |
| `/dashboard/page.tsx` | Server | Reads search params, fetches data |
| `/dashboard/loading.tsx` | Server | Skeleton UI |
| `/events/new/page.tsx` | Server | Shell that renders client form |
| `/events/[id]/edit/page.tsx` | Server | Fetches event, passes to client form |
| `Navbar` | Client | Sign out button interaction |
| `SearchFilterBar` | Client | Input state, URL param updates |
| `EventCard` | Client | Delete dialog interaction |
| `EventForm` | Client | react-hook-form, dynamic venue fields |
| `DeleteEventDialog` | Client | Dialog state, action call |

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

## Database Schema

### `events`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → `auth.users(id)`, ON DELETE CASCADE, NOT NULL |
| `name` | TEXT | NOT NULL |
| `sport_type` | TEXT | NOT NULL |
| `date_time` | TIMESTAMPTZ | NOT NULL |
| `description` | TEXT | Nullable |
| `created_at` | TIMESTAMPTZ | Default NOW() |
| `updated_at` | TIMESTAMPTZ | Default NOW() |

### `venues`
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `event_id` | UUID | FK → `events(id)`, ON DELETE CASCADE, NOT NULL |
| `name` | TEXT | NOT NULL |
| `address` | TEXT | Nullable |
| `city` | TEXT | Nullable |
| `state` | TEXT | Nullable |
| `zip_code` | TEXT | Nullable |
| `created_at` | TIMESTAMPTZ | Default NOW() |

### RLS Policies
- Users can only SELECT, INSERT, UPDATE, DELETE their own events
- Venue policies are tied to event ownership via subquery
