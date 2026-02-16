**Fastbreak Event Dashboard**

Full-stack sports event management application I built for the Fastbreak developer challenge. The application is live and fully compliant with the technical specifications provided.
Live: sports-event-management-gold.vercel.app

**Project Overview**
Sports Event Management Platform is where users can create, view, and manage sports events with venue information. Users sign in with Google, land on a dashboard showing their events, and from there they can create new events, edit existing ones, delete with confirmation, and search or filter by name or sport type. Each event can have one or more venues attached to it.
The challenge came with a detailed spec that outlined the tech stack, phases, component boundaries, database schema, and server action patterns. The stack was prescribed as Next.js with App Router, TypeScript, Supabase for database and auth, Tailwind CSS, shadcn/ui, and Vercel for deployment. Server actions over API routes was a requirement. The only API route is /auth/callback because the Supabase OAuth flow needs it.
Before writing any code, I created a set of documentation files: requirement.md, architecture.md, codingstandards.md, design.md, userflow.md, and CLAUDE.md. I did this because the entire project was built through agentic AI development. Every time an AI agent picks up a task, it needs full context on what the project is, what the goals are, what patterns to follow, and what standards to maintain. Without these files, the agent starts from scratch each session and makes inconsistent decisions. By having everything documented upfront, the agent reads the docs, understands the constraints, and writes code that stays aligned with the project from start to finish. This was not optional for me, it was how I kept the codebase consistent across multiple coding sessions.
For the login page, the spec just asked for a branded page with the logo and a sign-in button. Since the instructions did not specify a design for navigation bars, headers, or the login page, I reached out to the recruiter to ask if I could design a more polished login interface while keeping all original functionality intact. After getting approval, I built an interactive basketball shooting game that renders behind the login card. It has physics-based ball movement, a draggable ground line, particle effects, score tracking, and a tip carousel that shows Fastbreak facts on every basket. The card uses a glassmorphism design with a league bar across the top and a stats ticker along the bottom. I made the game responsive across mobile and desktop with a layout calculator that derives positions and sizes from the screen dimensions.
All original login functionality is preserved. The Google sign-in button, error handling on auth failure, and redirect behavior work exactly as specified.

**Architecture Decisions**
Most of the architectural patterns came from the spec. Server actions for data operations, the createSafeAction wrapper for Zod validation and typed responses, a shared EventForm for create and edit, URL search params for filtering, and clear server/client component boundaries. Below are the decisions I made on my own.
I went with delete-and-reinsert for venue updates. When a user edits an event, the code deletes all existing venues for that event and inserts the new set from the form. I considered diffing the arrays to figure out what changed but it was not worth the complexity given the small venue count per event.
I added a manual rollback on event creation. The event row gets inserted first, then the venue rows. If venues fail, the code deletes the event it just created. The Supabase JS client does not support multi-table transactions so this was the practical approach.
I kept event pages outside the dashboard layout. The spec gave two options and I went with dashboard-only. /events/new and /events/[id]/edit sit alongside /dashboard as siblings. They have their own "Back to Dashboard" links and middleware handles auth. I did not see a reason to wrap them in the dashboard navbar.
I added a redundant auth check in the dashboard layout on top of middleware. Just an extra safety net in case middleware ever gets misconfigured.
I did not add a client-side Supabase instance anywhere. All database access goes through server actions. No real-time subscriptions, no optimistic updates. Every mutation goes to the server and the dashboard refreshes through revalidatePath. For what this app needs, that was enough.
The basketball game on the login page is one component file, about 1500 lines. Physics, rendering, input, layout math, particles, tip rotation. I would normally split this up but it is self-contained and only used on one page so I left it as is.

**Trade-offs**
I did not add debouncing on search. Every keystroke triggers router.push and a server refetch. Works fine at this scale but would need debouncing or client-side filtering on a larger dataset.
I have a full page loading skeleton on filter changes instead of a localized loading indicator on just the results area. It works but briefly replaces the whole page content. I would scope it down to just the event grid if I had more time.
I did not write tests. This is a challenge submission so I focused on completing all requirements and the login page. In production I would have Vitest on the safe-action wrapper and schemas, and Playwright for auth and CRUD flows.
The canvas game is not optimized for low-end devices. It runs a continuous Canvas2D loop that works well on modern hardware but older phones could drop frames. I have prefers-reduced-motion respected for CSS animations but the canvas loop does not check for it currently.
I used Tailwind v4 @theme inline and @utility directives for design tokens in globals.css instead of a config file. Cleaner approach but editor tooling is still catching up. Autocomplete may not resolve custom class names like fb-aqua or fb-galaxy.

**Setup Instructions**
You need Node.js 18+ and a Supabase project.

**Clone and install**

git clone https://github.com/julanbasnet/Sports-Event-Management.git
cd Sports-Event-Management
npm install

**Supabase database**

Create a project at supabase.com and run the following in the SQL editor:
create table events (
id uuid default gen_random_uuid() primary key,
user_id uuid references auth.users(id) on delete cascade not null,
name text not null,
sport_type text not null,
date_time timestamptz not null,
description text,
created_at timestamptz default now() not null,
updated_at timestamptz default now() not null
);
create table venues (
id uuid default gen_random_uuid() primary key,
event_id uuid references events(id) on delete cascade not null,
name text not null,
address text,
city text,
state text,
zip_code text,
created_at timestamptz default now() not null
);
alter table events enable row level security;
alter table venues enable row level security;
create policy "Users manage own events" on events
for all using (auth.uid() = user_id);
create policy "Users manage own venues" on venues
for all using (
event_id in (select id from events where user_id = auth.uid())
);


Google OAuth

In the Supabase dashboard, go to Authentication, then Providers, then Google. Enable it and enter your Google OAuth client ID and secret. Add the redirect URL that Supabase provides to your Google Cloud Console credentials.

Environment variables

Create .env.local in the project root:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
Both values are in your Supabase project settings under API.

Run

npm run dev
The app will be available at http://localhost:3000.

Deploy

Push to GitHub and connect the repository to Vercel. Add the same environment variables in the Vercel project settings. Make sure the Supabase Google OAuth redirect URL includes your Vercel production domain.
**Tech Stack Rationale**
The stack was defined by the challenge specification. This section is about how the technologies fit together in my implementation.
The server action model worked well. I have every database operation as a function with "use server" at the top. No separate API files, no fetch calls from the client. The createSafeAction wrapper handles Zod validation and error catching for every action so the return type is always ActionResult<T>, either success with data or failure with an error message. I used server components for data fetching on the dashboard and edit pages. Client components are only where interaction is needed: the form, the search bar, and the delete dialog.
Supabase handles both the database and authentication. Events have many venues through a foreign key with ON DELETE CASCADE, so deleting an event removes its venues at the database level. Row-Level Security policies enforce that users can only access their own data. That enforcement happens in the database, not just in application code. @supabase/ssr manages cookie-based sessions through Next.js middleware.
I defined design tokens for the Fastbreak brand (aqua, galaxy, sky colors, glow shadows) in globals.css using Tailwind v4's @theme inline. For the complex styles on the login page like the glass card, button glow, ground handle, and broadcast bars, I wrapped them in @utility directives. This keeps the component code focused on structure while the design system stays in one CSS file.
I used shadcn/ui for the UI components throughout the app: Card, Dialog, Select, Form, Badge, and Skeleton. The Form component integrates with react-hook-form and zodResolver connects the same Zod schemas I use on the server side. useFieldArray manages the dynamic venue list. I wrote validation once in the schema files and it is shared between client and server.
Sonner handles toast notifications, set up once in the root layout. Geist font is loaded through the geist package with CSS variable injection for sans and mono variants.
