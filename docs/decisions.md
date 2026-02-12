# Architecture & Implementation Decisions

## DEC-001: Badge color Tailwind class selection

**Date:** 2026-02-12
**Context:** design.md specifies exact hex values for each sport badge. The original implementation used approximate Tailwind color classes for Cricket, Golf, and Swimming that did not match the specified hex values.

**Decision:** Use the exact Tailwind utility classes whose default hex values match design.md:
- Cricket: `bg-green-50 text-green-700` (matches #F0FDF4 / #15803D)
- Golf: `bg-emerald-50 text-emerald-800` (matches #ECFDF5 / #065F46)
- Swimming: `bg-sky-50 text-sky-900` (matches #F0F9FF / #0C4A6E)

**Alternatives considered:** Using arbitrary values like `bg-[#F0FDF4]`. Rejected because standard Tailwind classes produce the exact same hex values and are more maintainable.

## DEC-002: Unused @radix-ui/react-popover removal

**Date:** 2026-02-12
**Context:** `@radix-ui/react-popover` was present in package.json but not imported by any source file.

**Decision:** Removed the dependency to reduce supply chain surface area and install size.

## DEC-003: Events pages not wrapped by dashboard layout (existing)

**Date:** 2026-02-12 (documented, not changed)
**Context:** requirement.md 3.2 offers two options: dashboard-only layout OR shared layout wrapping all protected pages. architecture.md explicitly places `/events/*` as siblings of `/dashboard`, not nested under it. The events pages have "Back to Dashboard" navigation and middleware provides auth protection.

**Decision:** No change. The current architecture is intentional per architecture.md. Events pages rely on middleware for auth and provide dedicated back-navigation. Changing this would require an architecture.md revision.
