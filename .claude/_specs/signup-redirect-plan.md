# Implementation Plan — Signup Redirect to Dashboard

## Context

The signup flow (create account → set codename → write Firestore doc) had no navigation after completion, leaving the user stranded on the signup page. This adds a redirect to `/heists` as the final step of a successful signup so the user lands on the dashboard immediately.

## Files modified

| File                                 | Change                                                           |
| ------------------------------------ | ---------------------------------------------------------------- |
| `components/AuthForm/AuthForm.tsx`   | Import `useRouter`, call `router.push('/heists')` after `setDoc` |
| `tests/components/AuthForm.test.tsx` | Mock `next/navigation`, assert redirect is called on success     |

## Implementation steps

### 1. AuthForm (`components/AuthForm/AuthForm.tsx`)

- Import `useRouter` from `next/navigation`
- Call `useRouter()` at the top of the component
- After `setDoc(...)` succeeds, call `router.push('/heists')`
- Placed inside the `try` block — only fires on full success, not on error

### 2. Tests (`tests/components/AuthForm.test.tsx`)

- Add `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))`
- Add `const mockPush = vi.fn()` at module level
- Add test: "redirects to /heists after successful signup" — asserts `mockPush` called with `'/heists'`

## Verification

1. `npx vitest run` — all 43 tests pass
2. Manual: sign up at `http://localhost:3000/signup` → lands on `/heists`
