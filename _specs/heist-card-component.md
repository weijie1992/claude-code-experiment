# Heist Card Component

## Overview

Build a `HeistCard` component and a `HeistCardSkeleton` loading placeholder, then wire them into the `/heists` dashboard page. Cards are displayed in a responsive 3-column grid and show only **active** and **assigned** heists (not expired ones). The card title links to the heist detail page (`/heists/:id`).

**Figma reference:** `https://www.figma.com/design/BpoWpPOljZI9q7MpU8BBVu/Page-Designs--Copy-?node-id=14-2`

## Goals

- Display active and assigned heists as cards on the `/heists` page.
- Each card shows the heist title (linked to its detail page), the assignee codename, the creator codename, and the deadline.
- Show a skeleton placeholder grid while heists are loading.
- Exclude expired heists from the dashboard view.
- Create an empty `/heists/:id` detail page route so that links resolve without a 404.

## User Stories

- As a logged-in user, I want to see my active heists (assigned to me, not yet expired) displayed as cards on the dashboard so I know what missions I need to complete.
- As a logged-in user, I want to see heists I have assigned to others (not yet expired) so I can track their progress.
- As a logged-in user, I want to click a heist title to navigate to its detail page.
- As a logged-in user, I want a loading skeleton to appear while heist data is fetching so the page feels responsive.

## Design Spec (from Figma)

### HeistCard Visual Design

**Card container:**

- Background: `light` token (`#101828`)
- Border: ~1px solid `#1e2939`, border-radius 10px
- Padding: ~20px on all sides

**Title (top area):**

- Font: Inter Regular, 16px, white, line-height 24px
- Wraps up to 2 lines
- Rendered as a `<Link>` to `/heists/:id`
- A small icon (link/external, 16px) sits in the top-right corner of the card

**Metadata rows (below title, gap ~8px between rows):**

- Each row: small icon (12px) + label text + value text, all on one line
- Font: Inter Regular, 14px
- Row 1 — "To:" label in `body` color (`#99a1af`) + `@assignedToCodename` in `primary` color (`#c27aff`)
- Row 2 — "By:" label in `body` color + `@createdByCodename` in `secondary` color (`#fb64b6`)
- Row 3 — Formatted deadline in `body` color + a bullet separator + a time-remaining or "Overdue" string in `primary` color

**Deadline/status display (row 3):**

- Format: `"Dec 5, 05:00 PM • Overdue"` when past deadline
- Format: `"Dec 7, 02:00 PM • 4h 42m"` when time remains
- The status portion (after `•`) is rendered in `primary` purple

## Functional Requirements

### HeistCard Component

Display the following fields from the `Heist` type:

| Field                | Display Label  | Notes                                                                       |
| -------------------- | -------------- | --------------------------------------------------------------------------- |
| `title`              | (card heading) | Rendered as a `<Link>` to `/heists/:id`; white, 16px                        |
| `assignedToCodename` | To:            | Prefixed with `@`; rendered in `primary` purple                             |
| `createdByCodename`  | By:            | Prefixed with `@`; rendered in `secondary` pink                             |
| `deadline`           | (date row)     | Formatted date + `•` + time-remaining string or "Overdue" in primary purple |

### HeistCardSkeleton Component

- Matches the visual layout of `HeistCard` with animated placeholder blocks instead of real content.
- Rendered in the same 3-column grid while `loading === true`.
- Show a fixed number of skeleton cards (e.g. 6) as placeholders.

### /heists Page Layout

- Render two sections: **Your Active Missions** (mode `"active"`) and **Heists You've Assigned** (mode `"assigned"`).
- Each section uses the `useHeists` hook for its respective mode.
- While `loading` is true for a section, show the skeleton grid.
- While `error` is set, show an inline error message for that section.
- If the heists array is empty (and not loading), show an empty-state message per section.
- Cards are laid out in a 3-column grid (responsive: 1-column on mobile, 2-column on tablet, 3-column on desktop).

### /heists/:id Detail Page

- Add the route at `app/(dashboard)/heists/[id]/page.tsx`.
- No content required — a bare page shell is sufficient for now (so that links do not 404).

## Out of Scope

- Heist detail page content.
- Editing, deleting, or completing a heist from the card.
- Expired heists section.
- Pagination or infinite scroll.
- Sorting or filtering controls.

## Acceptance Criteria

- [ ] `HeistCard` renders title, assignee codename, creator codename, and formatted deadline.
- [ ] The heist title is a Next.js `<Link>` pointing to `/heists/:id`.
- [ ] `HeistCardSkeleton` mirrors the card layout with animated placeholder elements.
- [ ] The `/heists` page shows an **active** section and an **assigned** section, each powered by `useHeists`.
- [ ] Skeleton cards are displayed while data is loading; real cards replace them once loaded.
- [ ] Expired heists are never shown (filtered by `useHeists` mode — no additional client-side filtering needed).
- [ ] An empty-state message appears per section when there are no heists to display.
- [ ] The `/heists/:id` route exists and renders without a 404.
- [ ] Cards display in a 3-column grid (responsive).
- [ ] No new runtime dependencies are introduced.
