# Spec for Navbar Logout Button

branch: claude/feature/navbar-logout
figma_component (if used): N/A

## Summary

- Add a logout button to the `Navbar` component that signs the user out via Firebase Auth.
- The button is only visible when a user is currently logged in.
- No redirect occurs after logout — the user stays on the current page.

## Functional Requirements

- The `NavbarUser` component (already rendered in the `Navbar`) should include a logout button alongside the `Avatar`.
- The button calls Firebase Auth's `signOut` using the `auth` export from `lib/firebase.ts`.
- The button must only render when `user` is not null (i.e. when the user is signed in). It must not render when `loading` is true or `user` is null.
- After `signOut` resolves, the `AuthProvider`'s `onAuthStateChanged` listener will automatically set `user` to `null`, hiding the button and avatar.
- No manual redirect or navigation should happen on logout.
- Only the Firebase Web SDK should be used (`signOut` from `firebase/auth`).

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- `signOut` could fail (e.g. network error) — the error should be caught silently; do not show an error to the user for a failed logout.
- Clicking logout multiple times rapidly should not cause issues — consider disabling the button while the sign-out is in progress.
- The button must not flash briefly on page load before the auth state is known — it should only appear once `loading` is false and `user` is non-null.

## Acceptance Criteria

- A logout button appears in the Navbar when a user is signed in.
- Clicking the button calls `signOut` and the button + avatar disappear once the auth state updates.
- The logout button is not visible when no user is signed in.
- The logout button is not visible while auth state is loading.
- No redirect occurs after logout.
- Existing Navbar and NavbarUser tests continue to pass.

## Open Questions

- Should the logout button have a text label ("Log out"), an icon, or both? Both

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- The logout button renders when a user is signed in.
- The logout button does not render when user is null.
- The logout button does not render while auth state is loading.
- Clicking the logout button calls `signOut`.
