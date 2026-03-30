# Spec for Route Protection

branch: claude/feature/route-protection
figma_component (if used): N/A

## Summary

- Protect the `(public)` and `(dashboard)` route groups so that each is only accessible to the appropriate auth state.
- Pages in `(public)` (login, signup) should redirect authenticated users away to `/heists`.
- Pages in `(dashboard)` (heists list, create, detail) should redirect unauthenticated users away to `/login`.
- Both group layouts should show a simple loading indicator while Firebase auth state is being resolved, preventing a flash of the wrong page before the redirect fires.
- The existing `useUser` hook (from `AuthProvider`) is the source of truth for auth state — no new auth logic is introduced.

## Functional Requirements

- In the `(public)` layout, call `useUser` to get the current user and a loading flag.
  - While loading, render a simple centered loader in place of the page content.
  - Once resolved, if a user is present, redirect to `/heists` using `useRouter`.
  - If no user is present, render the page content normally.
- In the `(dashboard)` layout, call `useUser` to get the current user and a loading flag.
  - While loading, render a simple centered loader in place of the page content.
  - Once resolved, if no user is present, redirect to `/login` using `useRouter`.
  - If a user is present, render the page content (including the `<Navbar />`) normally.
- Both layouts must be client components (`"use client"`) because they call a hook.
- The loader should be minimal — a single visual indicator (e.g. a spinner or pulsing element) centered on screen. No external library should be added for this.
- The loader should use existing theme tokens (colours, sizing) rather than hardcoded values.
- Do not alter the `useUser` hook or `AuthProvider` — this spec only touches the two group layouts.

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- Firebase `onAuthStateChanged` fires asynchronously on every page load — without a loading state, users will briefly see the page content before being redirected.
- A logged-in user directly navigating to `/login` or `/signup` must be silently redirected without seeing a flash of the form.
- An unauthenticated user directly navigating to `/heists` or any dashboard page must be redirected to `/login`.
- The `useUser` hook exposes a `loading` boolean (or similar indeterminate state) — the layouts must handle the case where auth state is not yet known.
- Deep links into the dashboard (e.g. `/heists/123`) must also be protected — the check lives in the layout, so all child routes are covered automatically.

## Acceptance Criteria

- Visiting `/login` or `/signup` while authenticated redirects to `/heists` without rendering the form.
- Visiting any dashboard route while unauthenticated redirects to `/login` without rendering dashboard content.
- A loader is displayed in both layouts while Firebase resolves the initial auth state.
- No flash of unauthorised content occurs for either group on initial load.
- Existing tests continue to pass.
- No new dependencies are introduced.

## Open Questions

- Should the loader be a shared component (e.g. `<LoadingScreen />`) or inlined separately in each layout? A shared component avoids duplication but adds a new file. shared
- What is the exact shape of the value returned by `useUser` — does it expose `{ user, loading }` or just `user | null`? If only `user | null`, a null initial value is ambiguous between "loading" and "logged out" — the spec may need to revisit whether `useUser` needs updating first. make it explicit with `{ user, loading }`

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `(public)` layout renders children when user is `null` and loading is `false`.
- `(public)` layout renders the loader when loading is `true`.
- `(public)` layout redirects to `/heists` when a user is present.
- `(dashboard)` layout renders children when a user is present and loading is `false`.
- `(dashboard)` layout renders the loader when loading is `true`.
- `(dashboard)` layout redirects to `/login` when user is `null`.
