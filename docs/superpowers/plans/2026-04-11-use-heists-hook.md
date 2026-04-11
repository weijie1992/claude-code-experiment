# useHeists Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `useHeists(mode)` custom hook that subscribes to real-time Firestore heist data, then use it on the heists dashboard page to display heist titles for all three result sets.

**Architecture:** A standalone hook at `hooks/useHeists.ts` using Firestore `onSnapshot` with mode-specific compound queries. The hook returns `{ heists, loading, error }`. The heists page converts to a client component and calls the hook three times — once per section.

**Tech Stack:** Next.js 15 App Router, Firebase Firestore (`firebase/firestore`), React Testing Library + Vitest (`renderHook`), CSS Modules + Tailwind CSS 4.

---

## File Structure

| Action | Path                              | Responsibility                                                |
| ------ | --------------------------------- | ------------------------------------------------------------- |
| Create | `hooks/useHeists.ts`              | Real-time Firestore subscription hook with mode-based queries |
| Create | `tests/hooks/useHeists.test.ts`   | Full hook test suite using `renderHook`                       |
| Modify | `app/(dashboard)/heists/page.tsx` | Convert to client component; render heist title lists         |

---

## Task 1: Write failing tests for useHeists

**Files:**

- Create: `tests/hooks/useHeists.test.ts`

- [ ] **Step 1: Create the test file**

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHeists } from "@/hooks/useHeists";

// ── Firebase mocks ────────────────────────────────────────────
const mockUnsubscribe = vi.fn();
const mockOnSnapshot = vi.fn();
const mockQuery = vi.fn(() => "query-ref");
const mockWhere = vi.fn(() => "where-clause");
const mockTimestampNow = vi.fn(() => ({ toDate: () => new Date() }));

const mockWithConverter = vi.fn(() => "converted-ref");
const mockCollection = vi.fn(() => ({ withConverter: mockWithConverter }));

vi.mock("firebase/firestore", () => ({
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  Timestamp: { now: () => mockTimestampNow() },
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@/types/firestore", () => ({
  COLLECTIONS: { HEISTS: "heists", USERS: "users" },
  heistConverter: { toFirestore: vi.fn(), fromFirestore: vi.fn() },
}));

vi.mock("@/components/AuthProvider/AuthProvider", () => ({
  useUser: () => ({ user: { uid: "user-1" }, loading: false }),
}));

// ── Helpers ───────────────────────────────────────────────────
const fakeHeist = {
  id: "h1",
  title: "Steal the chair",
  description: "From the corner office.",
  createdBy: "user-1",
  createdByCodename: "SilentFox",
  assignedTo: "user-2",
  assignedToCodename: "PhantomWolf",
  deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
  finalStatus: null,
  createdAt: new Date(),
};

let capturedOnNext: (snapshot: unknown) => void;
let capturedOnError: (error: unknown) => void;

function setupSnapshot(docs = [{ data: () => fakeHeist }]) {
  mockOnSnapshot.mockImplementation(
    (
      _q: unknown,
      onNext: (s: unknown) => void,
      onError: (e: unknown) => void,
    ) => {
      capturedOnNext = onNext;
      capturedOnError = onError;
      return mockUnsubscribe;
    },
  );
}

// ── Tests ─────────────────────────────────────────────────────
describe("useHeists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSnapshot();
  });

  describe("Initial state", () => {
    it("returns loading: true before snapshot fires", () => {
      const { result } = renderHook(() => useHeists("active"));
      expect(result.current.loading).toBe(true);
    });

    it("returns an empty heists array before snapshot fires", () => {
      const { result } = renderHook(() => useHeists("active"));
      expect(result.current.heists).toEqual([]);
    });

    it("returns error: null before any error occurs", () => {
      const { result } = renderHook(() => useHeists("active"));
      expect(result.current.error).toBeNull();
    });
  });

  describe("After snapshot fires", () => {
    it("sets loading to false after first snapshot", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnNext({ docs: [{ data: () => fakeHeist }] }));
      expect(result.current.loading).toBe(false);
    });

    it("returns mapped heist objects from snapshot docs", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnNext({ docs: [{ data: () => fakeHeist }] }));
      expect(result.current.heists).toEqual([fakeHeist]);
    });

    it("returns empty array when snapshot has no docs", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnNext({ docs: [] }));
      expect(result.current.heists).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("sets error message when snapshot errors", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnError(new Error("Permission denied")));
      expect(result.current.error).toBe("Failed to load heists.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Query mode — active", () => {
    it("queries where assignedTo equals current user uid", () => {
      renderHook(() => useHeists("active"));
      expect(mockWhere).toHaveBeenCalledWith("assignedTo", "==", "user-1");
    });

    it("queries where deadline is greater than now", () => {
      renderHook(() => useHeists("active"));
      const calls = mockWhere.mock.calls;
      expect(
        calls.some(([field, op]) => field === "deadline" && op === ">"),
      ).toBe(true);
    });
  });

  describe("Query mode — assigned", () => {
    it("queries where createdBy equals current user uid", () => {
      renderHook(() => useHeists("assigned"));
      expect(mockWhere).toHaveBeenCalledWith("createdBy", "==", "user-1");
    });

    it("queries where deadline is greater than now", () => {
      renderHook(() => useHeists("assigned"));
      const calls = mockWhere.mock.calls;
      expect(
        calls.some(([field, op]) => field === "deadline" && op === ">"),
      ).toBe(true);
    });
  });

  describe("Query mode — expired", () => {
    it("queries where deadline is less than now", () => {
      renderHook(() => useHeists("expired"));
      const calls = mockWhere.mock.calls;
      expect(
        calls.some(([field, op]) => field === "deadline" && op === "<"),
      ).toBe(true);
    });

    it("queries where finalStatus is not null", () => {
      renderHook(() => useHeists("expired"));
      expect(mockWhere).toHaveBeenCalledWith("finalStatus", "!=", null);
    });
  });

  describe("Cleanup", () => {
    it("calls the unsubscribe function on unmount", () => {
      const { unmount } = renderHook(() => useHeists("active"));
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });
  });
});
```

- [ ] **Step 2: Run tests — confirm they all fail**

```bash
npx vitest run tests/hooks/useHeists.test.ts
```

Expected: all tests fail with `Cannot find module '@/hooks/useHeists'`.

- [ ] **Step 3: Commit**

```bash
git add tests/hooks/useHeists.test.ts
git commit -m "test: add failing tests for useHeists hook"
```

---

## Task 2: Implement useHeists hook

**Files:**

- Create: `hooks/useHeists.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import { COLLECTIONS, heistConverter } from "@/types/firestore";
import type { Heist } from "@/types/firestore";

export type HeistMode = "active" | "assigned" | "expired";

interface UseHeistsResult {
  heists: Heist[];
  loading: boolean;
  error: string | null;
}

export function useHeists(mode: HeistMode): UseHeistsResult {
  const { user } = useUser();
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const now = Timestamp.now();
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );

    const q =
      mode === "active"
        ? query(
            heistsRef,
            where("assignedTo", "==", user.uid),
            where("deadline", ">", now),
          )
        : mode === "assigned"
          ? query(
              heistsRef,
              where("createdBy", "==", user.uid),
              where("deadline", ">", now),
            )
          : query(
              heistsRef,
              where("deadline", "<", now),
              where("finalStatus", "!=", null),
            );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setHeists(snapshot.docs.map((doc) => doc.data()));
        setLoading(false);
      },
      () => {
        setError("Failed to load heists.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [mode, user]);

  return { heists, loading, error };
}
```

- [ ] **Step 2: Run hook tests — all must pass**

```bash
npx vitest run tests/hooks/useHeists.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Run full test suite — no regressions**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add hooks/useHeists.ts
git commit -m "feat: add useHeists hook with real-time Firestore subscriptions"
```

---

## Task 3: Update HeistsPage to display heist titles

**Files:**

- Modify: `app/(dashboard)/heists/page.tsx`

The page must become a client component to call hooks. It renders heist titles for each of the three sections, with loading and empty states.

- [ ] **Step 1: Replace the page content**

```tsx
"use client";

import CreateHeistForm from "@/components/CreateHeistForm";
import { useHeists } from "@/hooks/useHeists";

export default function HeistsPage() {
  const active = useHeists("active");
  const assigned = useHeists("assigned");
  const expired = useHeists("expired");

  return (
    <div className="page-content">
      <CreateHeistForm />

      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {active.loading && <p>Loading...</p>}
        {active.error && <p>{active.error}</p>}
        {!active.loading && !active.error && active.heists.length === 0 && (
          <p>No active heists.</p>
        )}
        <ul>
          {active.heists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>

      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        {assigned.loading && <p>Loading...</p>}
        {assigned.error && <p>{assigned.error}</p>}
        {!assigned.loading &&
          !assigned.error &&
          assigned.heists.length === 0 && <p>No assigned heists.</p>}
        <ul>
          {assigned.heists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>

      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expired.loading && <p>Loading...</p>}
        {expired.error && <p>{expired.error}</p>}
        {!expired.loading && !expired.error && expired.heists.length === 0 && (
          <p>No expired heists.</p>
        )}
        <ul>
          {expired.heists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/heists/page.tsx"
git commit -m "feat: display heist titles on dashboard using useHeists hook"
```

---

## Spec Coverage Check

| Requirement                                                     | Covered by                        |
| --------------------------------------------------------------- | --------------------------------- |
| `useHeists(mode)` accepts `'active' \| 'assigned' \| 'expired'` | Task 2 hook + Task 1 tests        |
| `onSnapshot` used for real-time data                            | Task 2 hook                       |
| Unsubscribes on unmount                                         | Task 2 hook + Task 1 cleanup test |
| `active` mode: `assignedTo == uid` AND `deadline > now`         | Task 2 + Task 1 mode tests        |
| `assigned` mode: `createdBy == uid` AND `deadline > now`        | Task 2 + Task 1 mode tests        |
| `expired` mode: `deadline < now` AND `finalStatus != null`      | Task 2 + Task 1 mode tests        |
| Returns `{ heists, loading, error }`                            | Task 2 + Task 1 state tests       |
| Dashboard page renders heist titles per section                 | Task 3                            |
| Loading state shown while data pending                          | Task 3 page                       |
| Empty state shown when no heists                                | Task 3 page                       |
| Error state shown on failure                                    | Task 3 page + Task 1 error test   |

> **Note:** The `expired` query combines `where('deadline', '<', now)` with `where('finalStatus', '!=', null)`. Firestore requires a composite index for this combination. You may need to create it in the Firebase console or via `firestore.indexes.json` when testing against a real Firestore instance.
