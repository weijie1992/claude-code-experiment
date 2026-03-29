# Spec for Auth State Management

branch: claude/feature/auth-state-management
figma_component (if used): N/A

## Summary

- Add a global, real-time Firebase auth state listener to the app.
- Expose the current user (or `null` if logged out) to any page or component via a `useUser` hook.
- The hook follows React's `use` prefix convention — the user referred to it as `setUser` but the correct hook name is `useUser` (a setter is not a hook).
- No sign-up, login, or logout flows are included in this spec — just the listener and read access.

## Functional Requirements

- Create a `AuthProvider` React context provider that wraps the entire app.
- Inside `AuthProvider`, register a Firebase `onAuthStateChanged` listener on mount and clean it up on unmount.
- The listener updates a piece of state with the current `User` object when signed in, or `null` when signed out.
- Export a `useUser` hook that reads and returns the current user value from the context.
- `useUser` must be usable from any client component or page in the app without prop-drilling.
- The `Navbar` component should use `useUser` and, when a user is logged in, render the `Avatar` component using the user's `displayName` (or email as a fallback).
- The `Avatar` component currently accepts a `name` prop — no changes needed to its interface; the caller supplies the name from the hook.
- The provider must be added to the root layout (`app/layout.tsx`) so it wraps all routes.

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- `onAuthStateChanged` fires asynchronously — the initial user state is unknown until the first callback. The provider should handle a loading/indeterminate state so components don't flash incorrect UI.
- `user.displayName` may be `null` for some accounts — fall back to `user.email` when rendering `Avatar`.
- The hook must only be called inside client components (`'use client'`) — calling it in a Server Component should surface a clear error.
- Listener cleanup must occur on unmount to avoid memory leaks or stale state after navigation.

## Acceptance Criteria

- `useUser` returns `null` when no user is signed in.
- `useUser` returns the Firebase `User` object when a user is signed in.
- Signing in or out in another tab updates the user state in the current tab in real time.
- `Navbar` renders `Avatar` with the logged-in user's name/email, and renders nothing in its place when logged out.
- No existing pages or components break due to this change.
- The app compiles and passes linting with no new errors.

## Open Questions

- Should the loading/indeterminate state be exposed via the hook (e.g. `{ user, loading }`) or is a simple `null` initial value sufficient?
- Should `useUser` throw an error if called outside of `AuthProvider`, or silently return `null`?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser` returns `null` when rendered outside an authenticated context.
- `useUser` returns a mock user object when the provider is given a signed-in user.
- `Navbar` renders the `Avatar` component when a user is present.
- `Navbar` does not render the `Avatar` component when user is `null`.
- The auth listener is cleaned up (unsubscribed) when the provider unmounts.
