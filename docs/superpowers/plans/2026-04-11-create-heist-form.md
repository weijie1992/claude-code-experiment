# Create Heist Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `CreateHeistForm` component that writes a new document to the Firestore `heists` collection and redirects to `/heists` on success.

**Architecture:** A client-side React component using `useUser()` for the current user's identity, `getDocs` to populate the assignee dropdown from the `users` collection, and `addDoc` to persist the new heist. The component is rendered directly inside the existing `HeistsPage`.

**Tech Stack:** Next.js 15 App Router, Firebase Firestore (`firebase/firestore`), React Testing Library + Vitest, CSS Modules + Tailwind CSS 4.

---

## File Structure

| Action | Path                                                    | Responsibility                                         |
| ------ | ------------------------------------------------------- | ------------------------------------------------------ |
| Modify | `types/firestore/index.ts`                              | Add `USERS` to `COLLECTIONS` and export `UserDoc` type |
| Create | `components/CreateHeistForm/CreateHeistForm.tsx`        | Form UI + submission logic                             |
| Create | `components/CreateHeistForm/CreateHeistForm.module.css` | Scoped styles (extends AuthForm aesthetic)             |
| Create | `components/CreateHeistForm/index.ts`                   | Barrel export                                          |
| Create | `tests/components/CreateHeistForm.test.tsx`             | Full test suite                                        |
| Modify | `app/(dashboard)/heists/page.tsx`                       | Render `<CreateHeistForm />`                           |

---

## Task 1: Extend Firestore types

**Files:**

- Modify: `types/firestore/index.ts`

- [ ] **Step 1: Add `USERS` constant and `UserDoc` type**

Open `types/firestore/index.ts` and replace its contents with:

```ts
export * from "./heist";

export interface UserDoc {
  id: string;
  codename: string;
}

export const COLLECTIONS = {
  HEISTS: "heists",
  USERS: "users",
} as const;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/firestore/index.ts
git commit -m "feat: add USERS collection constant and UserDoc type"
```

---

## Task 2: Write failing tests for CreateHeistForm

**Files:**

- Create: `tests/components/CreateHeistForm.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateHeistForm from "@/components/CreateHeistForm";

// ── Firebase mocks ──────────────────────────────────────────
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockCollection = vi.fn();
const mockServerTimestamp = vi.fn(() => "SERVER_TIMESTAMP");

vi.mock("firebase/firestore", () => ({
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  serverTimestamp: () => mockServerTimestamp(),
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@/components/AuthProvider/AuthProvider", () => ({
  useUser: () => ({
    user: { uid: "user-1", displayName: "SilentFoxStrikes" },
    loading: false,
  }),
}));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// ── Helpers ─────────────────────────────────────────────────
const fakeUsers = [
  { id: "user-2", data: () => ({ id: "user-2", codename: "PhantomWolf" }) },
  { id: "user-3", data: () => ({ id: "user-3", codename: "CraftyCipher" }) },
];

function setupUsers() {
  mockGetDocs.mockResolvedValue({ docs: fakeUsers });
  mockCollection.mockReturnValue("col-ref");
}

async function renderAndWait() {
  render(<CreateHeistForm />);
  await waitFor(() =>
    expect(screen.queryByText("Loading agents...")).not.toBeInTheDocument(),
  );
}

async function fillAndSubmit() {
  await renderAndWait();
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Steal the chair" },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { value: "Take it from the corner office." },
  });
  fireEvent.change(screen.getByLabelText("Assign to"), {
    target: { value: "user-2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
}

// ── Tests ────────────────────────────────────────────────────
describe("CreateHeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupUsers();
  });

  describe("Rendering", () => {
    it("renders the title input", async () => {
      await renderAndWait();
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    it("renders the description textarea", async () => {
      await renderAndWait();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    it("shows a loading message while fetching users", () => {
      mockGetDocs.mockReturnValue(new Promise(() => {})); // never resolves
      mockCollection.mockReturnValue("col-ref");
      render(<CreateHeistForm />);
      expect(screen.getByText("Loading agents...")).toBeInTheDocument();
    });

    it("populates the assignee dropdown with user codenames", async () => {
      await renderAndWait();
      expect(
        screen.getByRole("option", { name: "PhantomWolf" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "CraftyCipher" }),
      ).toBeInTheDocument();
    });

    it("renders a submit button", async () => {
      await renderAndWait();
      expect(
        screen.getByRole("button", { name: "Create Heist" }),
      ).toBeInTheDocument();
    });
  });

  describe("Validation — does not submit when fields are missing", () => {
    it("does not call addDoc when title is empty", async () => {
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "desc" },
      });
      fireEvent.change(screen.getByLabelText("Assign to"), {
        target: { value: "user-2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it("does not call addDoc when description is empty", async () => {
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "title" },
      });
      fireEvent.change(screen.getByLabelText("Assign to"), {
        target: { value: "user-2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it("does not call addDoc when no assignee is selected", async () => {
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "title" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "desc" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe("Submission", () => {
    beforeEach(() => {
      mockAddDoc.mockResolvedValue({ id: "new-heist-id" });
    });

    it("calls addDoc with the correct heist data", async () => {
      await fillAndSubmit();
      await waitFor(() => expect(mockAddDoc).toHaveBeenCalledOnce());
      const [, input] = mockAddDoc.mock.calls[0];
      expect(input).toMatchObject({
        title: "Steal the chair",
        description: "Take it from the corner office.",
        createdBy: "user-1",
        createdByCodename: "SilentFoxStrikes",
        assignedTo: "user-2",
        assignedToCodename: "PhantomWolf",
        finalStatus: null,
        createdAt: "SERVER_TIMESTAMP",
      });
    });

    it("sets deadline approximately 48 hours from now", async () => {
      await fillAndSubmit();
      await waitFor(() => expect(mockAddDoc).toHaveBeenCalledOnce());
      const [, input] = mockAddDoc.mock.calls[0];
      const expectedDeadline = Date.now() + 48 * 60 * 60 * 1000;
      expect(
        Math.abs((input.deadline as Date).getTime() - expectedDeadline),
      ).toBeLessThan(2000);
    });

    it("redirects to /heists on success", async () => {
      await fillAndSubmit();
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/heists"));
    });

    it("shows an error message when addDoc fails", async () => {
      mockAddDoc.mockRejectedValue(new Error("Firestore error"));
      await fillAndSubmit();
      await waitFor(() =>
        expect(
          screen.getByText("Failed to create heist. Please try again."),
        ).toBeInTheDocument(),
      );
    });

    it("disables the submit button while submission is in progress", async () => {
      let resolve!: () => void;
      mockAddDoc.mockReturnValue(
        new Promise((res) => {
          resolve = () => res(undefined);
        }),
      );
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "title" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "desc" },
      });
      fireEvent.change(screen.getByLabelText("Assign to"), {
        target: { value: "user-2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(
        screen.getByRole("button", { name: "Creating..." }),
      ).toBeDisabled();
      resolve();
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Creating..." }),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
```

- [ ] **Step 2: Run tests — confirm they all fail**

```bash
npx vitest run tests/components/CreateHeistForm.test.tsx
```

Expected: all tests fail with `Cannot find module '@/components/CreateHeistForm'`.

---

## Task 3: Implement CreateHeistForm

**Files:**

- Create: `components/CreateHeistForm/CreateHeistForm.tsx`
- Create: `components/CreateHeistForm/CreateHeistForm.module.css`
- Create: `components/CreateHeistForm/index.ts`

- [ ] **Step 1: Create the CSS module**

```css
/* components/CreateHeistForm/CreateHeistForm.module.css */
@reference "../../app/globals.css";

.card {
  background-color: var(--color-light);
  border: 1px solid var(--color-lighter);
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 32rem;
}

.heading {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-heading);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-heading);
}

.input {
  background-color: var(--color-lighter);
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--color-heading);
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
  outline: none;
  width: 100%;
}

.input:focus {
  border-color: var(--color-primary);
}

.textarea {
  background-color: var(--color-lighter);
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--color-heading);
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
  outline: none;
  width: 100%;
  min-height: 6rem;
  resize: vertical;
}

.textarea:focus {
  border-color: var(--color-primary);
}

.submit {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
}

.loading {
  font-size: 0.875rem;
  color: var(--color-body);
}

.error {
  font-size: 0.8125rem;
  color: var(--color-error);
}
```

- [ ] **Step 2: Create the component**

```tsx
// components/CreateHeistForm/CreateHeistForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import { COLLECTIONS } from "@/types/firestore";
import type { UserDoc, CreateHeistInput } from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

export default function CreateHeistForm() {
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        setUsers(snapshot.docs.map((doc) => doc.data() as UserDoc));
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !assignedTo || !user) return;

    const assignedUser = users.find((u) => u.id === assignedTo);
    if (!assignedUser) return;

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);

    const input: CreateHeistInput = {
      title,
      description,
      createdBy: user.uid,
      createdByCodename: user.displayName ?? "",
      assignedTo,
      assignedToCodename: assignedUser.codename,
      deadline,
      finalStatus: null,
      createdAt: serverTimestamp(),
    };

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, COLLECTIONS.HEISTS), input);
      router.replace("/heists");
    } catch {
      setError("Failed to create heist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>New Heist</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="assignedTo">
            Assign to
          </label>
          {loadingUsers ? (
            <p className={styles.loading}>Loading agents...</p>
          ) : (
            <select
              id="assignedTo"
              className={styles.input}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Select an agent</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.codename}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={`btn ${styles.submit}`}
          disabled={submitting || loadingUsers}
        >
          {submitting ? "Creating..." : "Create Heist"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create the barrel export**

```ts
// components/CreateHeistForm/index.ts
export { default } from "./CreateHeistForm";
```

- [ ] **Step 4: Run the tests — confirm they all pass**

```bash
npx vitest run tests/components/CreateHeistForm.test.tsx
```

Expected: all tests pass.

- [ ] **Step 5: Run the full test suite to check for regressions**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/CreateHeistForm/ tests/components/CreateHeistForm.test.tsx
git commit -m "feat: add CreateHeistForm component with Firestore integration"
```

---

## Task 4: Render CreateHeistForm on the heists page

**Files:**

- Modify: `app/(dashboard)/heists/page.tsx`

- [ ] **Step 1: Import and render the form**

Replace the contents of `app/(dashboard)/heists/page.tsx` with:

```tsx
import CreateHeistForm from "@/components/CreateHeistForm";

export default function HeistsPage() {
  return (
    <div className="page-content">
      <CreateHeistForm />
      <div className="active-heists">
        <h2>Your Active Heists</h2>
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the full test suite**

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
git add app/(dashboard)/heists/page.tsx
git commit -m "feat: render CreateHeistForm on heists dashboard page"
```

---

## Spec Coverage Check

| Requirement                                         | Covered by                                     |
| --------------------------------------------------- | ---------------------------------------------- |
| Title, description, assignee inputs                 | Task 3 component + Task 2 tests                |
| Dropdown populated from `users` collection          | Task 3 `fetchUsers` + Task 2 rendering tests   |
| `createdBy` / `createdByCodename` from current user | Task 3 `handleSubmit` + Task 2 submission test |
| `createdAt` = `serverTimestamp()`                   | Task 3 + Task 2 submission test                |
| `deadline` = 48 hours from now                      | Task 3 + Task 2 deadline test                  |
| `finalStatus` = `null`                              | Task 3 + Task 2 submission test                |
| Redirect to `/heists` on success                    | Task 3 + Task 2 redirect test                  |
| Error message on Firestore failure                  | Task 3 + Task 2 error test                     |
| Submit button disabled while submitting             | Task 3 + Task 2 disabled test                  |
| Loading indicator while fetching users              | Task 3 + Task 2 loading test                   |
| Form rendered on heists page                        | Task 4                                         |
