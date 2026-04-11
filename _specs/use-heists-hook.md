# useHeists Hook

## Overview

Create a `useHeists` custom React hook that subscribes to real-time Firestore data from the `heists` collection. The hook accepts a query mode argument and returns a typed array of `Heist` objects filtered according to the mode. Once the hook exists, use it on the heists dashboard page to display the titles of each result set.

## Goals

- Provide a reusable hook for real-time heist data that abstracts all Firestore query logic.
- Support two query modes with distinct filtering rules: `active` and `expired`.
- Render heist titles for all three result sets (active, assigned, expired) on the heists dashboard page.

## User Stories

- As a logged-in user, I want to see the titles of heists I've created that are still active so I know what missions are in progress.
- As a logged-in user, I want to see the titles of heists assigned to me that are still active so I know what I need to do.
- As a logged-in user, I want to see the titles of expired heists that have a final status so I can review completed or failed missions.

## Functional Requirements

### Hook Interface

The hook is named `useHeists` and accepts a single argument:

| Argument | Type                 | Values                    |
| -------- | -------------------- | ------------------------- |
| `mode`   | string literal union | `'active'` \| `'expired'` |

The hook returns an object with the following shape:

| Field     | Type             | Description                                 |
| --------- | ---------------- | ------------------------------------------- |
| `heists`  | `Heist[]`        | Array of heist documents matching the query |
| `loading` | `boolean`        | `true` while the first snapshot is pending  |
| `error`   | `string \| null` | Error message if the subscription fails     |

### Query Modes

#### `'active'`

Returns heists that satisfy **all** of the following conditions:

- `assignedTo` equals the current authenticated user's UID
- `deadline` is a date in the future (has not passed)

#### `'expired'`

Returns heists that satisfy **all** of the following conditions:

- `deadline` is a date in the past (has passed)
- `finalStatus` is not `null`

The `expired` query is not scoped to the current user — it returns expired heists for all users.

### Real-Time Subscription

- The hook uses Firestore's `onSnapshot` listener (not a one-off `getDocs` call) so the returned array updates in real time without page refresh.
- The listener is unsubscribed when the component using the hook unmounts.
- While waiting for the first snapshot, `loading` is `true`.

### Heists Dashboard Page

The `app/(dashboard)/heists/page.tsx` page should use `useHeists` three times:

1. **"Your Active Heists"** section — `useHeists('active')` — displays the title of each returned heist.
2. **"Heists You've Assigned"** section — a separate query for heists created BY the current user where the deadline has not passed. This requires an additional mode: `'assigned'`.
3. **"All Expired Heists"** section — `useHeists('expired')` — displays the title of each returned heist.

> **Note on the "assigned" mode:** The "Heists You've Assigned" section needs heists where `createdBy` equals the current user's UID and the deadline has not passed. This is a third query mode that must be added to the hook.

### Updated Hook Modes (revised from user input)

| Mode         | Filter                                               |
| ------------ | ---------------------------------------------------- |
| `'active'`   | `assignedTo == currentUser.uid` AND `deadline > now` |
| `'assigned'` | `createdBy == currentUser.uid` AND `deadline > now`  |
| `'expired'`  | `deadline < now` AND `finalStatus != null`           |

### Loading and Error States

- While `loading` is true, show a loading indicator in place of the list.
- If `error` is set, show an inline error message in that section.
- If the query returns an empty array, show a neutral "No heists" message.

## Out of Scope

- Pagination or infinite scroll.
- Sorting or filtering beyond the defined modes.
- Displaying any heist fields other than `title` on the dashboard page.
- Writing, updating, or deleting heists from the hook.

## Acceptance Criteria

- [ ] `useHeists(mode)` hook exists and accepts `'active' | 'assigned' | 'expired'` as its argument.
- [ ] The hook subscribes with `onSnapshot` and unsubscribes on unmount.
- [ ] `'active'` mode returns heists where `assignedTo == uid` and `deadline > now`.
- [ ] `'assigned'` mode returns heists where `createdBy == uid` and `deadline > now`.
- [ ] `'expired'` mode returns heists where `deadline < now` and `finalStatus != null`.
- [ ] The hook returns `{ heists, loading, error }`.
- [ ] The heists dashboard page renders each result set's heist titles using the hook.
- [ ] Loading and empty states are handled visibly in the UI.
