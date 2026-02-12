# Fastbreak Event Dashboard — User Flows

---

## Flow 1: First-Time User (Unauthenticated)

```
1. User visits the app URL (/)
2. Middleware detects no session
3. Redirect to /login
4. User sees login page with:
   - App branding (Fastbreak logo/name)
   - "Sign in with Google" button
5. User clicks "Sign in with Google"
6. signInWithGoogle server action executes
7. Browser redirects to Google OAuth consent screen
8. User selects their Google account / grants permission
9. Google redirects to Supabase callback URL
10. Supabase processes OAuth, redirects to /auth/callback?code=xxx
11. Route handler exchanges code for session (sets auth cookies)
12. Redirect to /dashboard
13. User sees empty dashboard with:
    - Navbar (app name, user email/avatar, sign out button)
    - Empty state message: "No events yet"
    - "Create your first event" CTA button
```

---

## Flow 2: Returning User (Authenticated)

```
1. User visits the app URL (/)
2. Middleware detects valid session
3. Redirect to /dashboard
4. Dashboard Server Component fetches user's events
5. User sees their event list in a responsive grid
```

---

## Flow 3: Authentication Failure

```
1. User clicks "Sign in with Google"
2. Google OAuth process fails (user cancels, error occurs)
3. Supabase redirects to /auth/callback without valid code
4. Route handler detects failure
5. Redirect to /login?error=auth_failed
6. Login page reads ?error param
7. User sees error message: "Authentication failed. Please try again."
8. User can retry by clicking "Sign in with Google" again
```

---

## Flow 4: Sign Out

```
1. User clicks "Sign Out" button in navbar
2. signOut server action executes
3. Supabase clears session cookies
4. Redirect to /login
5. User sees login page
6. Any subsequent visit to protected routes redirects to /login
```

---

## Flow 5: View Dashboard (With Events)

```
1. User lands on /dashboard
2. Dashboard page (Server Component) reads URL searchParams
3. No search params → fetches all user's events with venues
4. Events returned sorted by date ascending
5. User sees:
   - Navbar at top
   - "Create Event" button
   - Search input + Sport filter dropdown
   - Responsive grid of event cards
6. Each event card shows:
   - Event name (title)
   - Sport type (badge)
   - Date & time (formatted)
   - Venue name(s) listed
   - Edit button (icon/link)
   - Delete button (icon)
```

---

## Flow 6: Search Events by Name

```
1. User is on /dashboard
2. User types "soccer" into the search input
3. Client component debounces input (optional)
4. URL updates to /dashboard?q=soccer
5. Page re-renders (Server Component)
6. searchEvents action called with { query: "soccer" }
7. Supabase query: WHERE name ILIKE '%soccer%'
8. Matching events returned and displayed
9. If no matches → empty state: "No events found"
10. User clears search input → URL returns to /dashboard → all events shown
```

---

## Flow 7: Filter Events by Sport Type

```
1. User is on /dashboard
2. User selects "Basketball" from sport type dropdown
3. URL updates to /dashboard?sport=Basketball
4. Page re-renders (Server Component)
5. searchEvents action called with { sport_type: "Basketball" }
6. Supabase query: WHERE sport_type = 'Basketball'
7. Filtered events returned and displayed
8. If no matches → empty state: "No events found"
9. User selects "All" or clears filter → URL returns to /dashboard → all events shown
```

---

## Flow 8: Combined Search + Filter

```
1. User types "tournament" in search input
2. URL: /dashboard?q=tournament
3. User also selects "Tennis" from sport dropdown
4. URL: /dashboard?q=tournament&sport=Tennis
5. searchEvents action called with { query: "tournament", sport_type: "Tennis" }
6. Supabase query: WHERE name ILIKE '%tournament%' AND sport_type = 'Tennis'
7. Results displayed — only Tennis events with "tournament" in the name
```

---

## Flow 9: Create Event

```
1. User clicks "Create Event" button on dashboard
2. Navigates to /events/new
3. Server Component renders page shell with title "Create Event"
4. EventForm (Client Component) renders in create mode with:
   - Empty event name input
   - Sport type select (placeholder: "Select a sport")
   - Date & time input (empty)
   - Description textarea (empty)
   - One blank venue section (venue name input + optional address fields)
   - "Add Venue" button
   - "Create Event" submit button
5. User fills in event details:
   - Types event name
   - Selects sport type from dropdown
   - Picks date and time
   - Optionally adds description
6. User fills venue name (required)
7. Optionally fills address, city, state, zip
8. User clicks "Add Venue" to add more venues
   - New blank venue fields appear
   - Each venue has a "Remove" button (disabled if only 1 venue)
9. User clicks "Create Event"
10. Client-side Zod validation runs:
    - If errors → inline error messages under invalid fields
    - If valid → proceed
11. Submit button shows loading spinner, becomes disabled
12. createEvent server action executes:
    - Server-side Zod validation
    - Authenticates user
    - Inserts event into events table
    - Inserts venues into venues table
    - revalidatePath("/dashboard")
13. On success:
    - Redirect to /dashboard
    - Toast: "Event created successfully"
    - New event appears in the grid
14. On error:
    - Toast: "Failed to create event: {error message}"
    - User remains on form, can fix and retry
```

---

## Flow 10: Edit Event

```
1. User clicks edit button on an event card
2. Navigates to /events/[id]/edit
3. Server Component fetches event by ID via getEventById
4. If event not found → redirect to /dashboard
5. If found → passes event data to EventForm as defaultValues
6. EventForm renders in edit mode with pre-filled:
   - Event name
   - Sport type (pre-selected)
   - Date & time (pre-filled)
   - Description (pre-filled)
   - Existing venues (one section per venue, pre-filled)
7. User modifies any fields
8. User can add new venues or remove existing ones (minimum 1)
9. User clicks "Update Event"
10. Client-side Zod validation runs
11. Submit button shows loading spinner
12. updateEvent server action executes:
    - Server-side Zod validation
    - Authenticates user
    - Updates event in events table
    - Deletes all existing venues for this event
    - Re-inserts updated venue list
    - revalidatePath("/dashboard")
13. On success:
    - Redirect to /dashboard
    - Toast: "Event updated successfully"
    - Updated event appears in the grid
14. On error:
    - Toast: "Failed to update event: {error message}"
    - User remains on form, can fix and retry
```

---

## Flow 11: Delete Event

```
1. User clicks delete button on an event card
2. Confirmation dialog opens (shadcn Dialog):
   - "Are you sure you want to delete this event?"
   - Event name displayed for confirmation
   - "Cancel" button
   - "Delete" button (destructive style)
3. User clicks "Cancel" → dialog closes, nothing happens
4. User clicks "Delete":
   - Delete button shows loading spinner
   - deleteEvent server action executes:
     - Authenticates user
     - DELETE FROM events WHERE id = eventId AND user_id = user.id
     - Venues cascade-delete automatically (FK constraint)
     - revalidatePath("/dashboard")
5. On success:
   - Dialog closes
   - Toast: "Event deleted successfully"
   - Event removed from the grid
6. On error:
   - Dialog closes
   - Toast: "Failed to delete event: {error message}"
```

---

## Flow 12: Dashboard Loading State

```
1. User navigates to /dashboard
2. Next.js Suspense boundary activates
3. loading.tsx renders:
   - Navbar (visible immediately)
   - Skeleton cards in a responsive grid matching the event card layout
   - Skeleton search bar + filter
4. Server Component finishes fetching data
5. Skeletons replaced with actual event cards
```

---

## Flow 13: Form Validation (Inline Errors)

```
1. User is on create or edit form
2. User clicks submit without filling required fields
3. react-hook-form + Zod validation triggers
4. Inline errors appear under each invalid field:
   - Event name: "Event name is required"
   - Sport type: "Please select a sport type"
   - Date & time: "Date and time is required"
   - Venue name: "Venue name is required"
5. User fills in the required field → error clears in real-time
6. Once all fields valid → form submits normally
```

---

## Flow 14: Dynamic Venue Management (Within Form)

```
1. Form loads with 1 venue section by default (create mode)
   OR with N venue sections pre-filled (edit mode)
2. Each venue section shows:
   - Venue name input (required)
   - Address input (optional)
   - City input (optional)
   - State input (optional)
   - Zip code input (optional)
   - "Remove" button (disabled if only 1 venue)
3. User clicks "Add Venue":
   - New blank venue section appended below existing ones
   - Smooth appearance
4. User clicks "Remove" on a venue:
   - That venue section removed
   - If removing would leave 0 venues → button is disabled / prevented
5. All venue data included in form submission
```

---

## Flow 15: Mobile Experience

```
1. On mobile viewport (< 768px):
   - Navbar collapses to compact layout
   - Event grid switches to single column
   - Search input and filter stack vertically
   - Event cards take full width
   - Form fields take full width
   - Venue sections stack cleanly
   - Buttons are full-width or appropriately sized for touch
2. On tablet (768px+):
   - Event grid shows 2 columns
3. On desktop (1024px+):
   - Event grid shows 3 columns
   - Search and filter sit side by side
```

---

## Flow Summary

| # | Flow | Entry Point | Exit Point |
|---|---|---|---|
| 1 | First-time user | `/` | `/dashboard` (empty) |
| 2 | Returning user | `/` | `/dashboard` (with events) |
| 3 | Auth failure | Google OAuth | `/login?error=auth_failed` |
| 4 | Sign out | Navbar | `/login` |
| 5 | View dashboard | `/dashboard` | — |
| 6 | Search by name | Search input | Updated event grid |
| 7 | Filter by sport | Sport dropdown | Updated event grid |
| 8 | Search + filter combined | Both inputs | Updated event grid |
| 9 | Create event | `/events/new` | `/dashboard` + success toast |
| 10 | Edit event | `/events/[id]/edit` | `/dashboard` + success toast |
| 11 | Delete event | Delete button on card | Dialog → `/dashboard` + success toast |
| 12 | Loading state | Navigation | Skeleton → content |
| 13 | Form validation | Form submit | Inline errors |
| 14 | Dynamic venues | Form | Add/remove venue sections |
| 15 | Mobile experience | Any page | Responsive layout |
