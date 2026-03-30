# Spec for Login Form Firebase Authentication

branch: claude/feature/login-form
figma_component (if used): N/A

## Summary

- Wire the existing login form (`AuthForm` in `app/(public)/login/`) to Firebase Authentication using the Firebase Web SDK via `lib/firebase.ts`.
- Upon successful login with correct credentials, display an inline success message to the user.
- No redirect occurs after login — navigation is out of scope for this spec.

## Functional Requirements

- The `AuthForm` component in `mode="login"` currently `console.log`s credentials. Replace this with a call to Firebase's `signInWithEmailAndPassword`.
- On success, display an inline success message (e.g. "You're logged in!") within the form.
- On failure (wrong password, user not found, etc.), display a user-readable inline error message.
- The submit button should be disabled while the login request is in flight.
- Clear the success and error messages when the user begins editing the form fields after a submission.
- The `signup` mode of `AuthForm` is not affected by this change.
- Only the Firebase Web SDK (`firebase/auth`) should be used.

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- Wrong password — Firebase returns `auth/invalid-credential`; show a friendly message.
- User not found — Firebase may return `auth/user-not-found` or `auth/invalid-credential`; show a friendly message.
- Too many failed attempts — Firebase returns `auth/too-many-requests`; show an appropriate message.
- Network error — show a generic fallback message.
- The success message should not persist if the user signs out and returns to the login page — it is transient UI state only.

## Acceptance Criteria

- Submitting the login form with valid credentials signs the user in and shows a success message.
- Submitting with incorrect credentials shows an inline error message.
- The submit button is disabled while the request is in flight.
- No redirect occurs after a successful login.
- The `signup` mode of `AuthForm` is unaffected.
- All existing `AuthForm` tests continue to pass.

## Open Questions

- What should the exact wording of the success message be?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `AuthForm` in `login` mode calls `signInWithEmailAndPassword` with the submitted email and password.
- A success message is shown after a successful login.
- An error message is shown when Firebase returns an auth error.
- The submit button is disabled while the login request is in flight.
- `AuthForm` in `signup` mode is unaffected (does not call `signInWithEmailAndPassword`).
