# Fastbreak Event Dashboard — Design System & Brand Guidelines

---

## Brand Overview

Fastbreak AI is the leading AI-powered sports operations platform, trusted by the NBA, NHL, MLS, Serie A, and 55+ leagues worldwide. Founded in 2022, headquartered in Charlotte, NC. The brand embodies speed, precision, and innovation in sports technology.

**Brand Personality:** Bold, fast, intelligent, trustworthy, modern
**Tagline:** "Accelerate Your Game"

---

## Color Palette

Sourced directly from the official Fastbreak AI Brand Kit.

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Bright Aqua** | `#17F2E3` | 23, 242, 227 | Primary accent, CTAs, highlights, active states, links |
| **Electric Sky** | `#49CBE8` | 73, 203, 232 | Secondary accent, gradients, hover states, badges |
| **Galaxy Black** | `#011627` | 1, 22, 39 | Primary background (dark mode), text on light backgrounds |
| **White** | `#FFFFFF` | 255, 255, 255 | Primary background (light mode), text on dark backgrounds |

### Extended Palette (Derived for UI)

| Name | Hex | Usage |
|---|---|---|
| **Galaxy Black Light** | `#0A2540` | Card backgrounds, elevated surfaces on dark mode |
| **Galaxy Black Muted** | `#1B3A4B` | Borders, dividers, subtle backgrounds |
| **Aqua Muted** | `#17F2E3` at 15% opacity | Hover backgrounds, selected states, subtle highlights |
| **Aqua Dark** | `#0ED2C5` | Text links on light backgrounds (WCAG AA compliant) |
| **Error Red** | `#EF4444` | Error states, destructive actions, delete buttons |
| **Error Red Muted** | `#EF4444` at 10% opacity | Error background fills |
| **Success Green** | `#22C55E` | Success toasts, confirmation states |
| **Warning Amber** | `#F59E0B` | Warning states, pending indicators |
| **Neutral 50** | `#FAFAFA` | Page background (light mode) |
| **Neutral 100** | `#F5F5F5` | Card backgrounds (light mode) |
| **Neutral 200** | `#E5E5E5` | Borders, dividers (light mode) |
| **Neutral 400** | `#A3A3A3` | Placeholder text, disabled states |
| **Neutral 600** | `#525252` | Secondary text |
| **Neutral 800** | `#262626` | Primary text (light mode) |

### Gradient

| Name | CSS | Usage |
|---|---|---|
| **Fastbreak Gradient** | `linear-gradient(135deg, #17F2E3 0%, #49CBE8 100%)` | Hero sections, feature highlights, primary CTA backgrounds |
| **Fastbreak Subtle** | `linear-gradient(135deg, #17F2E3 0%, #49CBE8 50%, #0A2540 100%)` | Dark section backgrounds |

---

## Typography

### Font Selection

| Role | Font | Weight | Fallback |
|---|---|---|---|
| **Headings** | Geist Sans | 700 (Bold), 600 (Semibold) | `system-ui, -apple-system, sans-serif` |
| **Body** | Geist Sans | 400 (Regular), 500 (Medium) | `system-ui, -apple-system, sans-serif` |
| **Mono / Code** | Geist Mono | 400 (Regular) | `ui-monospace, monospace` |

**Why Geist:** Fastbreak AI's website uses Geist (Vercel's typeface). It's modern, highly legible on screens, and ships natively with Next.js — zero additional font loading. Perfect alignment with the tech stack.

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **Display** | 36px / 2.25rem | 1.2 | 700 | Hero headings, login page title |
| **H1** | 30px / 1.875rem | 1.3 | 700 | Page titles ("Dashboard", "Create Event") |
| **H2** | 24px / 1.5rem | 1.35 | 600 | Section headings, card titles |
| **H3** | 20px / 1.25rem | 1.4 | 600 | Sub-section headings, dialog titles |
| **H4** | 16px / 1rem | 1.5 | 600 | Card subtitles, label emphasis |
| **Body** | 16px / 1rem | 1.6 | 400 | Default paragraph text |
| **Body Small** | 14px / 0.875rem | 1.5 | 400 | Secondary text, timestamps, metadata |
| **Caption** | 12px / 0.75rem | 1.4 | 400 | Badges, helper text, fine print |
| **Button** | 14px / 0.875rem | 1 | 500 | Button labels |

### Tailwind Classes Mapping

```
Display:    text-4xl font-bold tracking-tight
H1:         text-3xl font-bold tracking-tight
H2:         text-2xl font-semibold
H3:         text-xl font-semibold
H4:         text-base font-semibold
Body:       text-base font-normal
Body Small: text-sm font-normal
Caption:    text-xs font-normal
Button:     text-sm font-medium
```

---

## Spacing System

Based on a 4px base unit for consistency.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Icon gaps, compact padding |
| `space-3` | 12px | Input padding, small gaps |
| `space-4` | 16px | Standard padding, card padding |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Card padding, form field gaps |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Large section gaps |
| `space-12` | 48px | Page section separators |
| `space-16` | 64px | Major section padding |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | Badges, small elements |
| `rounded-md` | 8px | Inputs, buttons |
| `rounded-lg` | 12px | Cards, dialogs |
| `rounded-xl` | 16px | Large cards, featured sections |
| `rounded-full` | 9999px | Avatars, pills, circular buttons |

---

## Shadows

| Name | CSS | Usage |
|---|---|---|
| **Shadow SM** | `0 1px 2px rgba(1, 22, 39, 0.05)` | Subtle depth on inputs |
| **Shadow MD** | `0 4px 6px -1px rgba(1, 22, 39, 0.08), 0 2px 4px -2px rgba(1, 22, 39, 0.05)` | Cards, dropdowns |
| **Shadow LG** | `0 10px 15px -3px rgba(1, 22, 39, 0.08), 0 4px 6px -4px rgba(1, 22, 39, 0.03)` | Dialogs, modals |
| **Shadow Glow** | `0 0 20px rgba(23, 242, 227, 0.15)` | Primary CTA hover state |

---

## Component Design Tokens

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| **Primary** | `#17F2E3` | `#011627` | None | `#0ED2C5` with shadow glow |
| **Secondary** | `transparent` | `#011627` | `1px solid #E5E5E5` | `#F5F5F5` background |
| **Destructive** | `#EF4444` | `#FFFFFF` | None | `#DC2626` |
| **Ghost** | `transparent` | `#525252` | None | `#F5F5F5` background |
| **Link** | `transparent` | `#0ED2C5` | None | Underline |

| Size | Height | Padding | Font Size | Radius |
|---|---|---|---|---|
| **Small** | 32px | 12px horizontal | 12px | 6px |
| **Default** | 40px | 16px horizontal | 14px | 8px |
| **Large** | 48px | 24px horizontal | 16px | 8px |

### Inputs

| Property | Value |
|---|---|
| Height | 40px |
| Padding | 12px horizontal |
| Border | `1px solid #E5E5E5` |
| Border (focus) | `1px solid #17F2E3` |
| Ring (focus) | `0 0 0 2px rgba(23, 242, 227, 0.2)` |
| Border Radius | 8px |
| Background | `#FFFFFF` |
| Placeholder Color | `#A3A3A3` |
| Error Border | `1px solid #EF4444` |

### Cards

| Property | Value |
|---|---|
| Background | `#FFFFFF` |
| Border | `1px solid #E5E5E5` |
| Border Radius | 12px |
| Padding | 24px |
| Shadow | Shadow MD |
| Hover Shadow | Shadow LG |
| Hover Border | `1px solid #17F2E3` at 30% opacity |

### Badges (Sport Types)

| Sport | Background | Text |
|---|---|---|
| **Soccer** | `#DCFCE7` | `#166534` |
| **Basketball** | `#FEF3C7` | `#92400E` |
| **Tennis** | `#DBEAFE` | `#1E40AF` |
| **Baseball** | `#FEE2E2` | `#991B1B` |
| **Football** | `#F3E8FF` | `#6B21A8` |
| **Hockey** | `#E0F2FE` | `#075985` |
| **Volleyball** | `#FFF7ED` | `#9A3412` |
| **Cricket** | `#F0FDF4` | `#15803D` |
| **Golf** | `#ECFDF5` | `#065F46` |
| **Swimming** | `#F0F9FF` | `#0C4A6E` |

### Toasts (Sonner)

| Type | Style |
|---|---|
| **Success** | Green left border accent, check icon |
| **Error** | Red left border accent, x-circle icon |
| **Info** | Aqua left border accent, info icon |

---

## Layout System

### Page Container

```
max-width: 1280px (max-w-7xl)
padding: 16px mobile, 24px tablet, 32px desktop
margin: 0 auto (centered)
```

### Grid System

| Context | Mobile (< 768px) | Tablet (md: 768px+) | Desktop (lg: 1024px+) |
|---|---|---|---|
| **Event Grid** | 1 column | 2 columns | 3 columns |
| **Form Layout** | Single column | Single column | Single column (max-w-2xl centered) |
| **Dashboard Header** | Stacked | Inline (search + filter side by side) | Inline |

### Navbar

| Property | Value |
|---|---|
| Height | 64px |
| Background | `#FFFFFF` |
| Border Bottom | `1px solid #E5E5E5` |
| Position | Sticky top |
| Z-Index | 50 |
| Padding | 0 16px (mobile), 0 32px (desktop) |
| Content | Logo (left) — User info + Sign out (right) |

---

## Iconography

Using **Lucide React** — consistent with shadcn/ui.

| Action | Icon | Context |
|---|---|---|
| Create | `Plus` | Add event, add venue |
| Edit | `Pencil` | Edit event card action |
| Delete | `Trash2` | Delete event card action |
| Search | `Search` | Search input prefix |
| Filter | `Filter` | Sport filter dropdown |
| Calendar | `Calendar` | Date/time display |
| Map Pin | `MapPin` | Venue display |
| Sign Out | `LogOut` | Navbar sign out |
| Back | `ArrowLeft` | Navigation back to dashboard |
| Loading | `Loader2` | Spinner (animate-spin) |
| Empty | `CalendarX2` | Empty state illustration |
| Google | Custom SVG | Google sign-in button |
| Sport | `Trophy` | Sport type indicator |
| Chevron | `ChevronDown` | Select dropdown indicator |

---

## Animation & Motion

| Interaction | Animation | Duration |
|---|---|---|
| Button hover | Scale to 1.02, shadow glow | 150ms ease |
| Card hover | Subtle lift (translateY -2px), border color shift | 200ms ease |
| Page transitions | Fade in | 200ms ease |
| Toast enter | Slide in from top-right | 300ms ease-out |
| Toast exit | Fade out | 200ms ease |
| Loading spinner | Continuous rotate | 1s linear infinite |
| Skeleton pulse | Opacity 0.5 → 1 → 0.5 | 1.5s ease infinite |
| Dialog open | Fade in + scale from 0.95 | 200ms ease |
| Venue add/remove | Height expand/collapse | 200ms ease |

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Color contrast | All text meets WCAG AA minimum (4.5:1 for body, 3:1 for large text). `#0ED2C5` used for text links instead of `#17F2E3` for contrast compliance |
| Focus indicators | Visible focus ring: `0 0 0 2px #FFFFFF, 0 0 0 4px #17F2E3` |
| Keyboard navigation | All interactive elements are tabbable. Dialog traps focus. Escape closes dialogs |
| Screen readers | Semantic HTML, ARIA labels on icon-only buttons, form field labels, toast announcements |
| Reduced motion | Respect `prefers-reduced-motion` — disable non-essential animations |
| Touch targets | Minimum 44x44px for all interactive elements on mobile |

---

## Page-Specific Design

### Login Page

```
Layout:         Centered card on Galaxy Black (#011627) background
Card:           White, rounded-xl, shadow-lg, max-w-md
Content:        App logo/name (Display size), tagline, Google sign-in button
Google Button:  White background, dark text, Google icon left-aligned, full-width
                Border: 1px solid #E5E5E5, rounded-md, height 48px
Error:          Red alert banner above button when ?error param present
Footer:         "Powered by Fastbreak AI" in caption text
```

### Dashboard

```
Header:         Page title "Dashboard" (H1), "Create Event" primary button (right-aligned)
Search/Filter:  Below header. Search input (left, flex-1) + Sport select (right, w-48)
                Both on same row (desktop), stacked (mobile)
Grid:           gap-6, responsive columns per grid system
Cards:          See Card design tokens. Each card contains:
                - Sport badge (top-left)
                - Event name (H3)
                - Date with Calendar icon (Body Small, Neutral 600)
                - Venue(s) with MapPin icon (Body Small, Neutral 600)
                - Actions row: Edit (ghost button) + Delete (ghost destructive)
Empty State:    Centered vertically. CalendarX2 icon (48px, Neutral 400),
                "No events yet" (H3), "Create your first event" (Body, Neutral 600),
                "Create Event" primary button
Loading:        3-column grid of skeleton cards matching card dimensions
```

### Event Form (Create / Edit)

```
Layout:         Centered, max-w-2xl, white card with padding
Title:          "Create Event" or "Edit Event" (H1)
Back Link:      ArrowLeft + "Back to Dashboard" (top-left, ghost button)
Fields:         Stacked vertically, gap-6
                Each field: Label (H4) + Input + Error message (Caption, Error Red)
Venues Section: Separator line, "Venues" (H3), venue cards stacked
                Each venue: bordered card with name + optional fields in 2-col grid
                "Remove" ghost destructive button per venue (if > 1)
                "Add Venue" secondary button (full-width, dashed border)
Submit:         Primary button, full-width, large size
                Shows Loader2 spinner + "Creating..." / "Updating..." when loading
```

### Delete Confirmation Dialog

```
Overlay:        Black at 50% opacity
Dialog:         White, rounded-lg, shadow-lg, max-w-md, centered
Content:        Warning icon (Amber), "Delete Event" (H3),
                "Are you sure you want to delete '{event name}'? This cannot be undone." (Body)
Actions:        "Cancel" secondary button + "Delete" destructive button (right-aligned)
```

---

## Tailwind Config Customization

```typescript
// tailwind.config.ts — custom theme extensions
{
  extend: {
    colors: {
      'fb-aqua': '#17F2E3',
      'fb-aqua-dark': '#0ED2C5',
      'fb-sky': '#49CBE8',
      'fb-galaxy': '#011627',
      'fb-galaxy-light': '#0A2540',
      'fb-galaxy-muted': '#1B3A4B',
    },
    boxShadow: {
      'glow': '0 0 20px rgba(23, 242, 227, 0.15)',
    },
    backgroundImage: {
      'fb-gradient': 'linear-gradient(135deg, #17F2E3 0%, #49CBE8 100%)',
    },
  }
}
```

---

## shadcn/ui Theme Override

The default shadcn neutral theme will be customized via CSS variables in `globals.css` to align with Fastbreak brand colors:

```css
@layer base {
  :root {
    --background: 0 0% 100%;          /* White */
    --foreground: 210 95% 8%;         /* Galaxy Black */
    --primary: 174 90% 52%;           /* Bright Aqua */
    --primary-foreground: 210 95% 8%; /* Galaxy Black (text on aqua) */
    --secondary: 197 74% 60%;         /* Electric Sky */
    --accent: 174 90% 52%;            /* Bright Aqua */
    --destructive: 0 84% 60%;         /* Error Red */
    --ring: 174 90% 52%;              /* Bright Aqua focus ring */
    --radius: 0.5rem;                 /* 8px default radius */
  }
}
```

---

## Design Principles

| Principle | Application |
|---|---|
| **Speed** | Fast load times, minimal animations, instant feedback. Reflects "Fastbreak" brand ethos |
| **Clarity** | Clear hierarchy, generous whitespace, readable typography. Sports operators need info at a glance |
| **Consistency** | shadcn/ui components throughout, uniform spacing, predictable patterns |
| **Professionalism** | Clean, enterprise-grade look. No playful illustrations — this is used by NBA and NHL |
| **Accessibility** | Inclusive by default. Color isn't the sole indicator. Everything is keyboard navigable |
