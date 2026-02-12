# Fastbreak Event Dashboard — Architecture

---

## Folder & File Structure

```
fastbreak-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout — HTML shell, fonts, Sonner Toaster
│   │   ├── page.tsx                      # Root redirect → /dashboard or /login
│   │   ├── globals.css                   # Tailwind base styles
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page — Google SSO button
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts             # OAuth callback route handler
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Protected layout — Navbar wrapper
│   │   │   ├── page.tsx                  # Dashboard — reads search params, fetches events
│   │   │   └── loading.tsx               # Skeleton loading state
│   │   │
│   │   └── events/
│   │       ├── new/
│   │       │   └── page.tsx              # Create event — renders EventForm
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx          # Edit event — fetches event, renders EventForm
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   └── form.tsx
│   │   │
│   │   ├── layout/
│   │   │   └── navbar.tsx                # Client — app name, user info, sign out
│   │   │
│   │   ├── dashboard/
│   │   │   ├── search-filter-bar.tsx     # Client — search input, sport dropdown
│   │   │   ├── event-card.tsx            # Client — single event card with edit/delete
│   │   │   ├── event-grid.tsx            # Client — responsive grid of event cards
│   │   │   ├── empty-state.tsx           # Server — no events message + CTA
│   │   │   └── delete-event-dialog.tsx   # Client — confirmation dialog for delete
│   │   │
│   │   └── events/
│   │       └── event-form.tsx            # Client — shared create/edit form
│   │
│   ├── lib/
│   │   ├── utils.ts                      # shadcn cn() utility
│   │   │
│   │   ├── supabase/
│   │   │   ├── server.ts                 # Server client — cookies-based
│   │   │   └── middleware.ts             # Middleware client — request/response cookies
│   │   │
│   │   ├── actions/
│   │   │   ├── safe-action.ts            # Generic createSafeAction helper
│   │   │   ├── auth.ts                   # signInWithGoogle, signOut, getUser
│   │   │   └── events.ts                 # createEvent, updateEvent, deleteEvent, searchEvents, getEventById
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                  # Event, Venue, ActionResult, SPORT_TYPES
│   │   │
│   │   └── validations/
│   │       └── event.ts                  # Zod schemas — createEventSchema, updateEventSchema, searchEventsSchema, venueSchema
│   │
│   └── middleware.ts                     # Root middleware — route protection
│
├── .env.local                            # Supabase keys (not committed)
├── .gitignore
├── requirements.md
├── architecture.md
├── user-flow.md
├── README.md
├── components.json                       # shadcn config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Component Tree

```
RootLayout (Server)
├── Toaster (Sonner)
│
├── /login → LoginPage (Server)
│   └── Google Sign-In Button (triggers server action)
│
├── /auth/callback → Route Handler (Server)
│
├── /dashboard → DashboardLayout (Server)
│   └── Navbar (Client)
│       └── Sign Out Button
│   └── DashboardPage (Server) — reads searchParams, calls searchEvents
│       ├── SearchFilterBar (Client) — updates URL params
│       ├── EventGrid (Client)
│       │   └── EventCard (Client) — per event
│       │       ├── Edit Button → navigates to /events/[id]/edit
│       │       └── Delete Button → opens DeleteEventDialog
│       │           └── DeleteEventDialog (Client) — confirm + calls deleteEvent action
│       └── EmptyState (Server) — shown when no events
│
├── /events/new → CreateEventPage (Server)
│   └── EventForm (Client) — create mode, no default values
│       └── Dynamic Venue Fields (useFieldArray)
│
└── /events/[id]/edit → EditEventPage (Server) — fetches event by ID
    └── EventForm (Client) — edit mode, pre-filled with event data
        └── Dynamic Venue Fields (useFieldArray)
```

---

## Server vs Client Component Boundaries

| Component | Type | Why |
|---|---|---|
| `app/layout.tsx` | Server | Static HTML shell |
| `app/page.tsx` | Server | Redirect logic only |
| `app/login/page.tsx` | Server | Renders static UI, button triggers server action |
| `app/auth/callback/route.ts` | Server | Route handler, no UI |
| `app/dashboard/layout.tsx` | Server | Wraps protected pages |
| `app/dashboard/page.tsx` | Server | Reads `searchParams`, calls server action, passes data down |
| `app/dashboard/loading.tsx` | Server | Static skeleton UI |
| `app/events/new/page.tsx` | Server | Shell that renders client form |
| `app/events/[id]/edit/page.tsx` | Server | Fetches event data, passes to client form |
| `Navbar` | Client | Interactive — sign out button |
| `SearchFilterBar` | Client | Interactive — controlled inputs, URL param updates |
| `EventCard` | Client | Interactive — delete dialog trigger |
| `EventGrid` | Client | Renders interactive EventCards |
| `DeleteEventDialog` | Client | Interactive — dialog state, action call |
| `EmptyState` | Server | Static UI, no interactivity |
| `EventForm` | Client | react-hook-form, useFieldArray, form state |

---

## Data Flow

### Read Flow (Dashboard)

```
1. User navigates to /dashboard?q=soccer&sport=Basketball
2. Middleware checks auth → user authenticated → allow
3. DashboardPage (Server Component) reads searchParams
4. Calls searchEvents server action with { query: "soccer", sport_type: "Basketball" }
5. Server action validates input via Zod
6. Server action creates Supabase client (server.ts)
7. Queries: SELECT * FROM events WHERE user_id = auth.uid() AND name ILIKE '%soccer%' AND sport_type = 'Basketball'
8. Joins venues via SELECT *, venues(*)
9. Returns ActionResult<Event[]>
10. DashboardPage passes events to EventGrid
11. EventGrid renders EventCards
```

### Write Flow (Create/Edit)

```
1. User fills EventForm (Client Component)
2. react-hook-form validates via zodResolver
3. On submit → calls createEvent/updateEvent server action
4. Server action validates input via Zod (double validation)
5. Server action authenticates user via getUser()
6. Server action creates Supabase client (server.ts)
7. INSERT/UPDATE events table
8. INSERT venues (delete old venues first on update)
9. revalidatePath("/dashboard")
10. redirect("/dashboard")
11. On error → returns ActionResult with error message
12. Client shows toast (success or error)
```

### Delete Flow

```
1. User clicks delete on EventCard
2. DeleteEventDialog opens (Client Component)
3. User confirms
4. Calls deleteEvent server action
5. Server action authenticates user
6. DELETE FROM events WHERE id = eventId AND user_id = user.id
7. Venues cascade-delete via FK constraint
8. revalidatePath("/dashboard")
9. Returns success/error
10. Client shows toast + UI updates
```

### Auth Flow

```
1. User visits any protected route
2. Middleware creates Supabase client, calls getUser()
3. No user → redirect to /login
4. User clicks "Sign in with Google"
5. signInWithGoogle server action calls supabase.auth.signInWithOAuth
6. Supabase returns Google OAuth URL
7. Server action redirects user to Google
8. User authenticates with Google
9. Google redirects to Supabase callback URL
10. Supabase redirects to /auth/callback with code
11. Route handler exchanges code for session
12. Redirect to /dashboard
```

---

## Search & Filter Strategy

| Aspect | Approach |
|---|---|
| Mechanism | URL search params (`?q=&sport=`) |
| Trigger | Client component updates URL via `router.push` or `router.replace` |
| Execution | Dashboard Server Component reads `searchParams` on every request |
| Database query | `searchEvents` server action builds dynamic Supabase query |
| Name search | `ILIKE '%query%'` on events.name |
| Sport filter | `WHERE sport_type = value` (exact match) |
| Combined | Both applied simultaneously when present |
| Reset | Clear params → full event list |
| Debounce | Optional — debounce search input on client side to avoid excessive refetches |

---

## State Management

| State | Where | How |
|---|---|---|
| Auth session | Supabase cookies | Managed by `@supabase/ssr`, read in middleware and server components |
| Search/filter params | URL | `?q=&sport=` — read by Server Component via `searchParams` prop |
| Form state | Client (react-hook-form) | `useForm` hook with `zodResolver` |
| Dynamic venues | Client (react-hook-form) | `useFieldArray` hook |
| Delete dialog open/close | Client (React state) | `useState` in DeleteEventDialog |
| Toast notifications | Client (Sonner) | `toast.success()` / `toast.error()` after action results |
| Loading (page) | Next.js | `loading.tsx` with Suspense boundary |
| Loading (actions) | Client (React state) | `isPending` from `useTransition` or manual state |

---

## Error Handling Strategy

| Layer | Mechanism |
|---|---|
| **Zod validation (client)** | react-hook-form + zodResolver catches invalid input before submission. Inline field errors displayed under each input |
| **Zod validation (server)** | `createSafeAction` re-validates on server side. Returns `{ success: false, error: "..." }` |
| **Supabase errors** | Caught in try/catch within server actions. Error message forwarded in `ActionResult` |
| **Auth errors** | Middleware redirects. OAuth failures redirect to `/login?error=auth_failed`. Login page reads error param |
| **Not found** | Edit page — `getEventById` returns null → redirect to `/dashboard` |
| **Network errors** | try/catch in client components around action calls → error toast |
| **Unexpected errors** | `createSafeAction` catch-all → generic "An unexpected error occurred" |

---

## Type Safety

| Layer | Tool |
|---|---|
| Input validation | Zod schemas (`createEventSchema`, `updateEventSchema`, `searchEventsSchema`) |
| Action return types | `ActionResult<T>` — discriminated union: `{ success: true, data: T }` or `{ success: false, error: string }` |
| Database types | `Event`, `Venue` TypeScript interfaces |
| Form types | Inferred from Zod: `z.infer<typeof createEventSchema>` |
| Props | Standard TypeScript props interfaces per component |

---

## Security

| Concern | Mitigation |
|---|---|
| Unauthorized access | Middleware blocks unauthenticated requests to protected routes |
| Data isolation | RLS policies — users can only access their own events and venues |
| Server-side only DB access | No `createBrowserClient` — all Supabase calls through `server.ts` |
| Double validation | Zod validates on client (UX) and server (security) |
| CSRF | Server actions are POST-only by default in Next.js |
| Env vars | `SUPABASE_SERVICE_ROLE_KEY` is server-only (no `NEXT_PUBLIC_` prefix) |
