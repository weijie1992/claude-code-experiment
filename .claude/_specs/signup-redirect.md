# Spec for Signup Redirect to Dashboard

branch: claude/feature/firebase-signup-random-codename
figma_component (if used): N/A

## Summary

- After a successful signup flow (account creation, profile update, Firestore write), redirect the user to the `/heists` dashboard.
- The redirect should only happen on success — errors leave the user on the signup page.

## Functional Requirements

- After `setDoc` completes successfully in the signup flow, call `router.push('/heists')` to navigate the user to the dashboard.
- Use `useRouter` from `next/navigation` (Next.js App Router).
- The redirect must not fire if any step in the signup flow throws an error.
- Login mode is unaffected.

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- If the Firestore write succeeds but the redirect fails (network issue), the user is still authenticated — the `AuthProvider` will pick up the new user via `onAuthStateChanged`.
- The redirect happens before the component unmounts, so no state updates should fire after it.

## Acceptance Criteria

- After successful signup, the user is redirected to `/heists`.
- If signup fails (e.g. duplicate email), the user stays on `/signup` and sees the error message.
- Login mode still uses `console.log` and does not redirect.

## Open Questions

- None.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `router.push('/heists')` is called after a successful signup.
- `router.push` is NOT called when the Firebase signup throws an error.
